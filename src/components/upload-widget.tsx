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

        if (initializeWidget()) return;

        const interval_id = window.setInterval(() => {
            if (initializeWidget()) {
                window.clearInterval(interval_id);
            }
        }, 500);
        return () => window.clearInterval(interval_id);
    }, []);

    const openWidget = useCallback(() => {
        if (disabled) return;
        widgetRef.current?.open();
    }, [disabled]);

    return (
        <div className="space-y-2">
            {preview ? (
                <div className="upload-preview">
                    <img src={preview.url} alt="Upload File" />

                </div>
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
