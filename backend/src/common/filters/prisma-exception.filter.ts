import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erreur interne de la base de données';

    switch (exception.code) {
      case 'P2002': {
        // Valeur déjà utilisée (champ unique : nom, email, adresse IP...)
        status = HttpStatus.CONFLICT;
        const target = exception.meta?.target;
        const fields = Array.isArray(target) ? target.join(', ') : String(target ?? '');
        message = `Une valeur existe déjà pour : ${fields || 'un champ unique'}`;
        break;
      }
      case 'P2003':
        // Clé étrangère : élément lié inexistant, ou suppression d'un élément encore utilisé
        status = HttpStatus.CONFLICT;
        message =
          "Opération impossible : un élément lié est introuvable ou cet élément est encore utilisé ailleurs";
        break;
      case 'P2025':
        // Enregistrement à modifier ou supprimer introuvable
        status = HttpStatus.NOT_FOUND;
        message = 'Élément introuvable';
        break;
    }

    response.status(status).json({
      statusCode: status,
      error: HttpStatus[status],
      message,
    });
  }
}