import { findGifs } from '../repositories/gifRepository';

export const getGifs = async (userId: string) => {
    return await findGifs(userId);
}
