// CORS, or Cross-Origin Resource Sharing, is a security feature implemented by web browsers to control how web pages in one domain can request and interact with resources hosted on another domain. This security measure helps prevent malicious websites from making unauthorized requests on behalf of a user, which could lead to potential security vulnerabilities.

import express,{json} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {dirname,join} from 'path';
import { fileURLToPath } from 'url';
import usersRouter from './routes/users-routes.js';

dotenv.config();
const __dirname=dirname(fileURLToPath(import.meta.url));

const app=express();
const corsOptions={Credential:true,origin:process.env.URL||'*'};

app.use(cors(corsOptions));
app.use(json());
app.use(cookieParser());

app.use('/',express.static(join(__dirname,'public')));
app.use('/api/users',usersRouter);

app.listen(3005);