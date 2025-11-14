import { error } from "console";
import { ApiClientError } from "./api-client";

/**
 * Manejar errores de API de manera centralizada
 * @param error - Error capturado
 * @contex - contexto del error (ejemplo: "obtener productos")
 * @param defaultVlue - valor por defecto en caso de error 
 * @returns el valor por defecto si se proporciona, de lo contrario lanza el error
 **/


export function handleApiError<T> (error: unknown, context: string, defaultValue?: T): T {
    if(error instanceof ApiClientError){
        console.error(`Error al ${context}:`, {
            message: error.message,
            statusCode: error.statusCode,
        });
    }else {
        console.error(`Error inesperado al  ${context}:`, error);
    }
    if(defaultValue !== undefined){
        return defaultValue;
    }
    throw error;
}