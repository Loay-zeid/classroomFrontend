import { useCallback, useEffect, useRef, useState } from "react";
import type { UploadWidgetProps, UploadWidgetValue } from "@/types";
import { UploadCloud } from "lucide-react";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/constence";

const UploadWidget = ({ value, onChange, disabled }: UploadWidgetProps) => {
    const [preview, setPreview] = useState<UploadWidgetValue | null>(
        value ?? null,
    );
    const widgetRef = useRef<CloudinaryWidget | null>(null);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        setPreview(value ?? null);
    }, [value]);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        let intervalId: number | null = null;

        const cleanupWidget = () => {
            if (intervalId !== null) {
                window.clearInterval(intervalId);
                intervalId = null;
            }
            if (widgetRef.current?.destroy) {
                widgetRef.current.destroy();
                widgetRef.current = null;
            }
        };

        const initializeWidget = () => {
            if (widgetRef.current) return true;
            if (!window.cloudinary) return false;

            widgetRef.current = window.cloudinary.createUploadWidget({
                cloudName: CLOUDINARY_CLOUD_NAME,
                uploadPreset: CLOUDINARY_UPLOAD_PRESET,
                multiple: false,
                folder: "Uploads",
                maxFileSize: 5000000,
                clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
            }, (error: unknown, result?: CloudinaryUploadWidgetResults) => {
                if (!error && result?.event === "success") {
                    const payload: UploadWidgetValue = {
                        url: result.info.secure_url,
                        publicId: result.info.public_id,
                    };
                    setPreview(payload);
                    onChangeRef.current?.(payload);
                }
            });

            return true;
        };

        if (initializeWidget()) {
            return cleanupWidget;
        }

        intervalId = window.setInterval(() => {
            if (initializeWidget()) {
                cleanupWidget();
            }
        }, 500);
        return cleanupWidget;
    }, []);

    const openWidget = useCallback(() => {
        if (disabled) return;
        widgetRef.current?.open();
    }, [disabled]);

    return (
        <div className="space-y-2">
            {preview ? (
                <button
                    type="button"
                    className="upload-preview"
                    onClick={openWidget}
                    disabled={disabled}
                    aria-label="Replace uploaded image"
                >
                    <img src={preview.url} alt="Upload File" />
                </button>
            ) : (
                <div
                    className="upload-dropzone"
                    role="button"
                    tabIndex={0}
                    onClick={openWidget}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            openWidget();
                        }
                    }}
                >

                    <div className="upload-prompt">
                        <UploadCloud className="icon" />
                        <div>
                            <p>Click to upload photo</p>
                            <p>PNG, JPG up to 5mb</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadWidget;
