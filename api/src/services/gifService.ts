import { findGifs } from '../repositories/gifRepository';

export const getGifs = async (userId: string) => {
    return await findGifs(userId);
}

export const getCompletedGifs = async (userId: string) => {
    const gifs = await findGifs(userId);
    return gifs.filter(gif => gif.status === 'completed');
}
