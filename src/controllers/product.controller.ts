import { Request, Response } from "express";
import * as productService from "../services/product.service";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const createdBy = req.tokenData?.userId || "system";
    const { productName, remark, centerId, genericId } = req.body;

    const product = await productService.createProduct(
      productName,
      remark,
      centerId,
      genericId,
      createdBy
    );

    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { page, limit, search, centerId, genericId } = req.query;

    const products = await productService.getAllProducts({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string,
      centerId: centerId as string,
      genericId: genericId as string,
    });

    res.status(200).json(products);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const modifiedBy = req.tokenData?.userId || "system";
    const { productName, remark, genericId } = req.body;

    const updated = await productService.updateProduct(
      id,
      { productName, remark, genericId },
      modifiedBy
    );

    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    res.status(200).json(product);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedBy = req.tokenData?.userId || "system";

    const deleted = await productService.deleteProduct(id, deletedBy);

    res.status(200).json(deleted);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
