const contactProperties = {
  lastName: { type: 'string', example: 'Dreyfus' },
  firstName: { type: 'string', example: 'Shosanna' },
  middleName: { type: 'string', example: 'Landovna' },
  email: { type: 'string', example: 'ShosannaDreyfus@gmail.com' }
};

const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: 'Contact id from MongoDB'
};

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Spammer API',
    version: '1.0.0'
  },
  paths: {
    '/api/contacts': {
      get: {
        summary: 'List contacts',
        responses: {
          200: { description: 'Sorted contact list' }
        }
      },
      post: {
        summary: 'Add a contact',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['lastName', 'firstName', 'middleName', 'email'],
                properties: contactProperties
              }
            }
          }
        },
        responses: {
          201: { description: 'Created' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/api/contacts/{id}': {
      put: {
        summary: 'Update a contact',
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: contactProperties
              }
            }
          }
        },
        responses: {
          200: { description: 'Updated' },
          400: { description: 'Validation error' },
          404: { description: 'Not found' }
        }
      },
      delete: {
        summary: 'Delete a contact',
        parameters: [idParameter],
        responses: {
          200: { description: 'Deleted' },
          404: { description: 'Not found' }
        }
      }
    }
  }
};
