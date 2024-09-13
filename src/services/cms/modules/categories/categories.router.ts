import express from 'express';
import { CategoryController } from './categories.controller';
import { upload } from '../../../../configs/multerConfig';

const categoryRouter = express.Router();

categoryRouter.post('/', upload.single("file"), CategoryController.createCategory);
categoryRouter.get('/:id', CategoryController.getCategoryById);
categoryRouter.put('/:id', CategoryController.updateCategory);
categoryRouter.delete('/:id', CategoryController.deleteCategory);
categoryRouter.get('/', CategoryController.getAllCategories);

export default categoryRouter;
