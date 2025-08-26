import express from "express";
import * as productController from "../../controllers/product.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import { checkPermission } from "../../middlewares/role.middleware";
import { PERMISSIONS } from "../../constants/permissions.constants";
import { ProductSchema } from "../../schemas/product.schema";
import validate from "../../middlewares/validate.middleware";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  checkPermission(PERMISSIONS.PRODUCT_MANAGEMENT),
  validate(ProductSchema),
  productController.createProduct
);

router.get(
  "/",
  checkPermission(PERMISSIONS.PRODUCT_MANAGEMENT),
  productController.getAllProducts
);

router.get(
  "/:id",
  checkPermission(PERMISSIONS.PRODUCT_MANAGEMENT),
  productController.getProductById
);

router.put(
  "/:id",
  checkPermission(PERMISSIONS.PRODUCT_MANAGEMENT),
  validate(ProductSchema),
  productController.updateProduct
);

router.delete(
  "/:id",
  checkPermission(PERMISSIONS.PRODUCT_MANAGEMENT),
  productController.deleteProduct
);

export default router;
