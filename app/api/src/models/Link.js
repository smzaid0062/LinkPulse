import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    longUrl: { type: String, required: true },
    clicks: { type: Number, default: 0 },
    lastClickedAt: { type: Date, default: null },
  },
  { timestamps: true } // createdAt, updatedAt
);

export const Link = mongoose.model('Link', linkSchema);
