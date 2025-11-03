export const getUrl = () => {
    if (process.env.REACT_APP_BACKEND_URL) {
        return process.env.REACT_APP_BACKEND_URL;
    }
    return 'http://127.0.0.1:8000/'
}