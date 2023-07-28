import mongoose, { Document, Model, Schema } from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';

interface IFilm extends Document {
  film_name: string;
}

const filmSchema: Schema = new mongoose.Schema({
  film_name: String
});

// Check if the model is already defined
let Film: Model<IFilm>;
try {
  Film = mongoose.model<IFilm>('Film');
} catch (error) {
  Film = mongoose.model<IFilm>('Film', filmSchema);
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Connect to MongoDB
  if (mongoose.connections[0].readyState) {
    // Use current db connection
    handle(req, res);
  } else {
    // Create new db connection
    await mongoose.connect('mongodb+srv://artemschannel2:skyline007@cluster0.kk78amu.mongodb.net/hackawow');
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    handle(req, res);
  }
}

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const count: number = await Film.countDocuments();
    const random: number = Math.floor(Math.random() * count);
    const film: IFilm | null = await Film.findOne().skip(random);
    res.json(film);
  } else {
    res.status(405).json({message: 'Method Not Allowed'});
  }
}
