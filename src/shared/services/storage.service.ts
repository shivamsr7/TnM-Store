import { supabase } from "@/shared/lib/supabase";

const IMAGEKIT_UPLOAD_URL =
  "https://upload.imagekit.io/api/v1/files/upload";

const IMAGEKIT_PATH_PREFIX = "imagekit:";

interface ImageKitAuthResponse {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
}

interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  url: string;
  filePath: string;
  thumbnailUrl?: string;
}

export const storageService = {
  /**
   * Upload a new image directly to ImageKit.
   *
   * The browser first gets temporary upload credentials
   * from our authenticated Supabase Edge Function.
   *
   * The ImageKit private key NEVER reaches the browser.
   */
  async upload(file: File, folder = "") {
    console.log("UPLOAD FILE:", file);

    if (!(file instanceof File)) {
      throw new Error(
        "Invalid file passed to storageService.upload()"
      );
    }

    /*
     * 1. Ask our Supabase Edge Function for
     *    temporary ImageKit upload credentials.
     *
     * supabase.functions.invoke() automatically sends
     * the current Supabase user's session.
     */
    const {
      data: authData,
      error: authError,
    } = await supabase.functions.invoke(
      "imagekit-auth",
      {
        body: {},
      }
    );

    if (authError) {
      console.error(
        "ImageKit auth function error:",
        authError
      );

      throw new Error(
        "Unable to authenticate ImageKit upload."
      );
    }

    if (
      !authData?.token ||
      !authData?.signature ||
      !authData?.expire ||
      !authData?.publicKey
    ) {
      console.error(
        "Invalid ImageKit auth response:",
        authData
      );

      throw new Error(
        "Invalid ImageKit authentication response."
      );
    }

    const {
      token,
      signature,
      expire,
      publicKey,
    } = authData as ImageKitAuthResponse;

    /*
     * 2. Create a clean unique filename.
     *
     * ImageKit itself also supports useUniqueFileName.
     * We use both our own UUID and ImageKit's protection.
     */
    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      "jpg";

    const baseName =
      file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") ||
      "image";

    const fileName =
      `${baseName}-${crypto.randomUUID()}.${extension}`;

    /*
     * 3. Upload directly from the browser to ImageKit.
     */
    const formData = new FormData();

    formData.append("file", file);
    formData.append("fileName", fileName);

    formData.append(
      "publicKey",
      publicKey
    );

    formData.append(
      "signature",
      signature
    );

    formData.append(
      "expire",
      String(expire)
    );

    formData.append(
      "token",
      token
    );

    formData.append(
      "useUniqueFileName",
      "true"
    );

    /*
     * Keep the same folder structure you already use:
     *
     * products
     * banners/desktop
     * banners/mobile
     * etc.
     */
    if (folder) {
      formData.append(
        "folder",
        folder
      );
    }

    const response = await fetch(
      IMAGEKIT_UPLOAD_URL,
      {
        method: "POST",
        body: formData,
      }
    );

    let result: unknown = null;

    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      console.error(
        "ImageKit upload failed:",
        result
      );

      const message =
        typeof result === "object" &&
        result !== null &&
        "message" in result
          ? String(
              (result as { message?: unknown })
                .message
            )
          : "ImageKit upload failed.";

      throw new Error(message);
    }

    const uploadResult =
      result as ImageKitUploadResponse;

    if (
      !uploadResult.fileId ||
      !uploadResult.url
    ) {
      console.error(
        "Invalid ImageKit upload response:",
        uploadResult
      );

      throw new Error(
        "ImageKit returned an invalid upload response."
      );
    }

    /*
     * We prefix the fileId so storageService.remove()
     * can distinguish new ImageKit files from old
     * Supabase Storage paths.
     */
    return {
      path:
        `${IMAGEKIT_PATH_PREFIX}${uploadResult.fileId}`,

      publicUrl: uploadResult.url,
    };
  },

  /**
   * Remove an uploaded image.
   *
   * Existing Supabase images still use their old path,
   * while new ImageKit images use:
   *
   * imagekit:<fileId>
   *
   * ImageKit deletion will be handled by the secure
   * imagekit-delete Edge Function.
   */
  async remove(path: string) {
    if (!path) return;

    /*
     * NEW IMAGEKIT FILE
     */
    if (
      path.startsWith(
        IMAGEKIT_PATH_PREFIX
      )
    ) {
      const fileId = path.slice(
        IMAGEKIT_PATH_PREFIX.length
      );

      if (!fileId) return;

      const {
        data,
        error,
      } = await supabase.functions.invoke(
        "imagekit-delete",
        {
          body: {
            fileId,
          },
        }
      );

      if (error) {
        console.error(
          "ImageKit delete function error:",
          error
        );

        throw new Error(
          "Failed to delete ImageKit image."
        );
      }

      if (
        data?.success !== true
      ) {
        console.error(
          "ImageKit delete failed:",
          data
        );

        throw new Error(
          data?.error ||
            "Failed to delete ImageKit image."
        );
      }

      return;
    }

    /*
     * EXISTING SUPABASE FILE
     *
     * This keeps all your existing Supabase
     * images/deletion behavior working.
     */
    const BUCKET = "media";

    const {
      error,
    } = await supabase.storage
      .from(BUCKET)
      .remove([path]);

    if (error) {
      throw error;
    }
  },
};