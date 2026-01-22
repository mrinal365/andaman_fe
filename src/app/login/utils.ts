import { isValidEmail } from "@/utils"

export const isFormDataValid = (formData: any) => {
    if (!formData?.email?.length || !isValidEmail(formData?.email)) {
        return false
    }
    return false
}