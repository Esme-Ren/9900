import { getUrl } from "./ServerEnv";

export const apiCallPost = async (path: string, body: any, isAuthed: boolean ) => {
  try {
    const response = await fetch(getUrl() + path, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': isAuthed ? `Token ${localStorage.getItem('token')}` : ''
      },
      body: JSON.stringify(body)
    })
    const data = await response.json();
    return {
      statusCode: response.status,
      ...data
    };
  } catch (error: any) {
    console.log(error);
    return {
      statusCode: 500,
      error: 'Network error or server unavailable',
      message: 'Network error or server unavailable'
    };
  }
};

export const apiCallGet = async (path: string, isAuthed: boolean, headersExtra?: any) => {
  try {
    const response = await fetch(getUrl() + path, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': isAuthed ? `Token ${localStorage.getItem('token')}` : '',
        ...headersExtra
      },
    })
    const data = await response.json();
    return {
      statusCode: response.status,
      ...data
    };
  } catch (error: any) {
    console.log(error);
    return {
      statusCode: 500,
      error: 'Network error or server unavailable',
      message: 'Network error or server unavailable'
    };
  }
};

export const apiCallPatch = async (path: string, body: object, isAuthed: boolean) => {
  try {
    const response = await fetch(getUrl() + path, {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
        'Authorization': isAuthed ? `Token ${localStorage.getItem('token')}` : ''
      },
      body: JSON.stringify(body)
    })
    const data = await response.json();
    return {
      statusCode: response.status,
      ...data
    };
  } catch (error: any) {
    console.log(error);
    return {
      statusCode: 500,
      error: 'Network error or server unavailable',
      message: 'Network error or server unavailable'
    };
  }
};

export const apiCallDelete = async (path: string, isAuthed: boolean) => {
  try {
    const response = await fetch(getUrl() + path, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'Authorization': isAuthed ? `Token ${localStorage.getItem('token')}` : ''
      },
    })
    const data = await response.json();
    return {
      statusCode: response.status,
      ...data
    };
  } catch (error: any) {
    console.log(error);
    return {
      statusCode: 500,
      error: 'Network error or server unavailable',
      message: 'Network error or server unavailable'
    };
  }
};

export const apiCallPut = async (path: string, body: any, isAuthed: boolean) => {
  try {
    const response = await fetch(getUrl() + path, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        'Authorization': isAuthed ? `Token ${localStorage.getItem('token')}` : ''
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return {
      statusCode: response.status,
      ...data
    };
  } catch (error: any) {
    console.log(error);
    return {
      statusCode: 500,
      error: 'Network error or server unavailable',
      message: 'Network error or server unavailable'
    };
  }
};
