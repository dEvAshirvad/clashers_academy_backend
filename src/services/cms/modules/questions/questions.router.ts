import express from 'express';
import { QuestionController } from './questions.controller';
import { upload } from '../../../../configs/multerConfig';

const questionRouter = express.Router();

questionRouter.post('/', upload.single('file'), QuestionController.createQuestions);
questionRouter.get("/csv", QuestionController.exportQuestionsToCSV)
questionRouter.post("/csv", upload.single("file"), QuestionController.readCSV)
questionRouter.get('/:id', QuestionController.getQuestionById);
questionRouter.put('/:id', QuestionController.updateQuestion);
questionRouter.delete('/:id', QuestionController.deleteQuestion);
questionRouter.get('/', QuestionController.getAllQuestions);

export default questionRouter;
