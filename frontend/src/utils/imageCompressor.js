/**
 * Compresses an image file on the client side using the native HTML5 Canvas API.
 * Resizes large images down while maintaining the original aspect ratio
 * and re-encodes the image to a lightweight JPEG format.
 *
 * @param {File | Blob} file - The input image File or Blob.
 * @param {number} maxWidth - Maximum allowed width in pixels (default 1024).
 * @param {number} maxHeight - Maximum allowed height in pixels (default 1024).
 * @param {number} quality - JPEG compression quality between 0.0 and 1.0 (default 0.7).
 * @returns {Promise<Blob>} A Promise that resolves to the compressed JPEG Blob.
 */
export function compressImage(file, maxWidth = 1024, maxHeight = 1024, quality = 0.7) {
    return new Promise((resolve, reject) => {
        if (!file || !(file instanceof Blob)) {
            return reject(new Error("Invalid file provided for compression."));
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();

            img.onload = () => {
                try {
                    // Compute aspect-ratio preserved scaling
                    const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
                    const targetWidth = Math.round(img.width * ratio);
                    const targetHeight = Math.round(img.height * ratio);

                    const canvas = document.createElement("canvas");
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;

                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        return reject(new Error("Unable to acquire 2D canvas context."));
                    }

                    // Fill white background for transparent PNGs/WebPs before JPEG conversion
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, targetWidth, targetHeight);

                    // Draw the scaled image onto the canvas
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                    // Export as lightweight JPEG blob
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error("Canvas toBlob compression failed."));
                            }
                        },
                        "image/jpeg",
                        quality
                    );
                } catch (err) {
                    reject(err);
                }
            };

            img.onerror = () => {
                reject(new Error("Failed to load image into memory for compression."));
            };

            img.src = event.target.result;
        };

        reader.onerror = () => {
            reject(new Error("Failed to read image file."));
        };

        reader.readAsDataURL(file);
    });
}
