interface IErrorReponse {
    status: number;
    message: string;
}

export const errorHandler = (statusCode: number, message: string): IErrorReponse => {
    return {
        status: statusCode,
        message
    }
}