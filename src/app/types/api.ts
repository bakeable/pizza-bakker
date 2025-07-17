export interface Response<T> {
    status: 'success' | 'error';
    data?: T;
    error?: string;
}