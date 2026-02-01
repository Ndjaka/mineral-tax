/**
 * Service de stockage abstrait S3-compatible
 * Supporte Infomaniak Object Storage et fallback local en développement
 * 
 * Aucun impact sur la logique métier existante
 */

import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// Configuration
const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_BUCKET = process.env.S3_BUCKET || "mineraltax-user-files";
const S3_REGION = process.env.S3_REGION || "eu-west-1";
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
const NODE_ENV = process.env.NODE_ENV || "development";

// Durée de validité des signed URLs (en secondes)
const SIGNED_URL_EXPIRATION = 30 * 60; // 30 minutes

// Dossier local pour le fallback en développement
const LOCAL_STORAGE_PATH = path.join(process.cwd(), "uploads");

// Types de fichiers autorisés
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "application/pdf",
];

// Taille maximale des fichiers (10 Mo)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Déterminer le mode de stockage
const useS3 = Boolean(S3_ENDPOINT && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY);

// Client S3 (initialisé seulement si les credentials sont disponibles)
let s3Client: S3Client | null = null;

if (useS3) {
    s3Client = new S3Client({
        endpoint: S3_ENDPOINT,
        region: S3_REGION,
        credentials: {
            accessKeyId: S3_ACCESS_KEY_ID!,
            secretAccessKey: S3_SECRET_ACCESS_KEY!,
        },
        forcePathStyle: true, // Requis pour Infomaniak et autres S3-compatibles
    });
    console.log(`[Storage] Mode S3 activé - Endpoint: ${S3_ENDPOINT}, Bucket: ${S3_BUCKET}`);
} else {
    console.log(`[Storage] Mode local activé - Dossier: ${LOCAL_STORAGE_PATH}`);
    // Créer le dossier local si nécessaire
    if (!fs.existsSync(LOCAL_STORAGE_PATH)) {
        fs.mkdirSync(LOCAL_STORAGE_PATH, { recursive: true });
    }
}

/**
 * Types de fichiers par catégorie
 */
export type FileCategory = "receipts" | "documents" | "journals";

/**
 * Résultat d'un upload
 */
export interface UploadResult {
    success: boolean;
    key: string; // Clé unique du fichier
    url?: string; // URL d'accès (signed URL ou local)
    error?: string;
}

/**
 * Génère une clé unique pour un fichier
 */
function generateFileKey(
    userId: string,
    category: FileCategory,
    originalFilename: string,
    env: string = NODE_ENV
): string {
    const uuid = crypto.randomUUID();
    const ext = path.extname(originalFilename).toLowerCase();
    const timestamp = new Date().toISOString().split("T")[0];

    // Structure: /{env}/{userId}/{category}/{timestamp}_{uuid}{ext}
    return `${env}/${userId}/${category}/${timestamp}_${uuid}${ext}`;
}

/**
 * Valide un fichier avant upload
 */
function validateFile(
    buffer: Buffer,
    mimeType: string,
    filename: string
): { valid: boolean; error?: string } {
    // Vérifier la taille
    if (buffer.length > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024} Mo)`,
        };
    }

    // Vérifier le type MIME
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return {
            valid: false,
            error: `Type de fichier non autorisé: ${mimeType}`,
        };
    }

    return { valid: true };
}

/**
 * Upload un fichier vers le stockage
 */
export async function uploadFile(
    userId: string,
    category: FileCategory,
    buffer: Buffer,
    mimeType: string,
    originalFilename: string
): Promise<UploadResult> {
    // Validation
    const validation = validateFile(buffer, mimeType, originalFilename);
    if (!validation.valid) {
        return { success: false, key: "", error: validation.error };
    }

    const key = generateFileKey(userId, category, originalFilename);

    try {
        if (useS3 && s3Client) {
            // === Mode S3 ===
            const command = new PutObjectCommand({
                Bucket: S3_BUCKET,
                Key: key,
                Body: buffer,
                ContentType: mimeType,
                Metadata: {
                    userId,
                    category,
                    originalFilename,
                    uploadedAt: new Date().toISOString(),
                },
            });

            await s3Client.send(command);
            console.log(`[Storage] Upload S3 réussi: ${key}`);

            return { success: true, key };
        } else {
            // === Mode local (développement) ===
            const localPath = path.join(LOCAL_STORAGE_PATH, key);
            const dir = path.dirname(localPath);

            // Créer les sous-dossiers si nécessaire
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(localPath, buffer);
            console.log(`[Storage] Upload local réussi: ${localPath}`);

            return { success: true, key, url: `/uploads/${key}` };
        }
    } catch (error) {
        console.error(`[Storage] Erreur upload:`, error);
        return { success: false, key: "", error: String(error) };
    }
}

/**
 * Génère une URL signée temporaire pour accéder à un fichier
 * Vérifie que l'utilisateur est propriétaire du fichier
 */
export async function getSignedDownloadUrl(
    userId: string,
    key: string,
    expiresIn: number = SIGNED_URL_EXPIRATION
): Promise<{ success: boolean; url?: string; error?: string }> {
    // Vérification des droits : le userId doit être dans le chemin du fichier
    const keyParts = key.split("/");
    if (keyParts.length < 3 || keyParts[1] !== userId) {
        return { success: false, error: "Accès non autorisé" };
    }

    try {
        if (useS3 && s3Client) {
            // === Mode S3 ===
            const command = new GetObjectCommand({
                Bucket: S3_BUCKET,
                Key: key,
            });

            const url = await getSignedUrl(s3Client, command, { expiresIn });
            return { success: true, url };
        } else {
            // === Mode local ===
            const localPath = path.join(LOCAL_STORAGE_PATH, key);
            if (!fs.existsSync(localPath)) {
                return { success: false, error: "Fichier non trouvé" };
            }

            // En local, retourner le chemin relatif
            return { success: true, url: `/uploads/${key}` };
        }
    } catch (error) {
        console.error(`[Storage] Erreur génération URL:`, error);
        return { success: false, error: String(error) };
    }
}

/**
 * Télécharge un fichier (pour traitement backend)
 * Vérifie que l'utilisateur est propriétaire du fichier
 */
export async function downloadFile(
    userId: string,
    key: string
): Promise<{ success: boolean; buffer?: Buffer; mimeType?: string; error?: string }> {
    // Vérification des droits
    const keyParts = key.split("/");
    if (keyParts.length < 3 || keyParts[1] !== userId) {
        return { success: false, error: "Accès non autorisé" };
    }

    try {
        if (useS3 && s3Client) {
            // === Mode S3 ===
            const command = new GetObjectCommand({
                Bucket: S3_BUCKET,
                Key: key,
            });

            const response = await s3Client.send(command);
            const bodyContents = await response.Body?.transformToByteArray();

            if (!bodyContents) {
                return { success: false, error: "Fichier vide" };
            }

            return {
                success: true,
                buffer: Buffer.from(bodyContents),
                mimeType: response.ContentType,
            };
        } else {
            // === Mode local ===
            const localPath = path.join(LOCAL_STORAGE_PATH, key);
            if (!fs.existsSync(localPath)) {
                return { success: false, error: "Fichier non trouvé" };
            }

            const buffer = fs.readFileSync(localPath);
            const ext = path.extname(key).toLowerCase();
            const mimeType =
                ext === ".pdf"
                    ? "application/pdf"
                    : ext === ".png"
                        ? "image/png"
                        : ext === ".webp"
                            ? "image/webp"
                            : "image/jpeg";

            return { success: true, buffer, mimeType };
        }
    } catch (error) {
        console.error(`[Storage] Erreur téléchargement:`, error);
        return { success: false, error: String(error) };
    }
}

/**
 * Supprime un fichier
 * Vérifie que l'utilisateur est propriétaire du fichier
 */
export async function deleteFile(
    userId: string,
    key: string
): Promise<{ success: boolean; error?: string }> {
    // Vérification des droits
    const keyParts = key.split("/");
    if (keyParts.length < 3 || keyParts[1] !== userId) {
        return { success: false, error: "Accès non autorisé" };
    }

    try {
        if (useS3 && s3Client) {
            // === Mode S3 ===
            const command = new DeleteObjectCommand({
                Bucket: S3_BUCKET,
                Key: key,
            });

            await s3Client.send(command);
            console.log(`[Storage] Suppression S3 réussie: ${key}`);
            return { success: true };
        } else {
            // === Mode local ===
            const localPath = path.join(LOCAL_STORAGE_PATH, key);
            if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath);
                console.log(`[Storage] Suppression locale réussie: ${localPath}`);
            }
            return { success: true };
        }
    } catch (error) {
        console.error(`[Storage] Erreur suppression:`, error);
        return { success: false, error: String(error) };
    }
}

/**
 * Vérifie si un fichier existe
 */
export async function fileExists(
    key: string
): Promise<boolean> {
    try {
        if (useS3 && s3Client) {
            const command = new HeadObjectCommand({
                Bucket: S3_BUCKET,
                Key: key,
            });

            await s3Client.send(command);
            return true;
        } else {
            const localPath = path.join(LOCAL_STORAGE_PATH, key);
            return fs.existsSync(localPath);
        }
    } catch {
        return false;
    }
}

/**
 * Retourne les informations de configuration du stockage (pour debug)
 */
export function getStorageInfo(): {
    mode: "s3" | "local";
    bucket?: string;
    endpoint?: string;
    localPath?: string;
} {
    if (useS3) {
        return {
            mode: "s3",
            bucket: S3_BUCKET,
            endpoint: S3_ENDPOINT,
        };
    } else {
        return {
            mode: "local",
            localPath: LOCAL_STORAGE_PATH,
        };
    }
}

// Export du service complet
export const fileStorageService = {
    upload: uploadFile,
    download: downloadFile,
    getSignedUrl: getSignedDownloadUrl,
    delete: deleteFile,
    exists: fileExists,
    getInfo: getStorageInfo,
};

export default fileStorageService;
