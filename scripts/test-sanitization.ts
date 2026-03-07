import path from "path";

function sanitizeFilename(originalname: string): string {
    const ext = path.extname(originalname);
    const baseName = path.basename(originalname, ext).replace(/[^a-z0-9]/gi, "_").toLowerCase();
    return `${baseName}-${Date.now()}${ext}`;
}

const testFiles = [
    "my logo (1).png",
    "Institute Logo @2024.jpg",
    "simple-logo.png",
    "logo with spaces.jpeg"
];

console.log("Testing Filename Sanitization:");
testFiles.forEach(file => {
    console.log(`Original: "${file}" -> Sanitized: "${sanitizeFilename(file)}"`);
});
