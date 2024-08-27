import { findGifs } from '../repositories/gifRepository';

export const getGifs = async (userId: number) => {
    return await findGifs(userId);
}
