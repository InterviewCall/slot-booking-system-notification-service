import fs from 'fs/promises';
import Handlebars from 'handlebars';
import path from 'path';

import logger from '../configs/logger.config';
import { TemplateType } from '../utils/enums/TemplateType.enum';
import { InternalServerError } from '../utils/errors/app.error';

export async function renderTemplate(templateName: string, templateType: TemplateType, params: Record<string, string>): Promise<string> {
    const templatePath = path.join(__dirname, 'email', templateType, `${templateName}.hbs`);

    try {
        const content = await fs.readFile(templatePath, 'utf-8');
        const finalTemplate = Handlebars.compile<typeof params>(content);
        return finalTemplate(params);
    } catch (error) {
        logger.error('Something went wrong while rendering email template', { error });
        throw new InternalServerError('Something went wrong while rendering email template');
    }
}