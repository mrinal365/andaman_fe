export const uploadImage = async (file: File) => {
    // 1. Get auth
    const authRes = await getUploadAuth();
    const auth = authRes;
    console.log("auth response-----$$$$$", file.name)


    // 2. Upload to ImageKit
    const formData = new FormData();

    console.log("$$$$ file", file);
    console.log("$$$$ fileName", file.name);
    console.log("$$$$ token", auth.token);
    console.log("$$$$ signature", auth.signature);
    console.log("$$$$ expire", auth.expire);
    console.log("$$$$ publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_URL!);



    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("token", auth.token);
    formData.append("signature", auth.signature);
    formData.append("expire", auth.expire);
    formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
    console.log("before upload-----$$$$$", formData)

    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    console.log("data-----$$$$$", data)

    return data;
};

import api from './api';

export const getUploadAuth = async (): Promise<any> => {
    const response = await api.get<any>('/upload-image');
    return response.data;
};