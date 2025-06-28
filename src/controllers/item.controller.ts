import { Request, Response } from 'express';
import Item from '../models/item.model';

export const getItems = async (_: Request, res: Response) => {
  const items = await Item.find();
  res.json(items);
};

export const createItem = async (req: Request, res: Response) => {
  const newItem = await Item.create(req.body);
  res.status(201).json(newItem);
};

export const deleteItem = async (req: Request, res: Response) => {
  await Item.findByIdAndDelete(req.params.id);
  res.status(204).end();
};
