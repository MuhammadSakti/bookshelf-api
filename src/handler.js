const {nanoid} = require('nanoid');
const booksList = require('./books');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const finished = pageCount === readPage;
  const isReadPageMoreThanPage = readPage > pageCount;
  // ngambil content name terus ngecheck kosong atau tidak;
  const isBookName = request.payload.name;

  if (!isBookName) {
    const response = h.response(
        {
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        },
    );
    response.code(400);
    return response;
  }

  if (isReadPageMoreThanPage) {
    const response = h.response(
        {
          status: 'fail',
          // eslint-disable-next-line max-len
          message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        },
    );
    response.code(400);
    return response;
  }

  const newBook = {
    name, year, author,
    summary, publisher, pageCount,
    readPage, finished, reading,
    id, insertedAt, updatedAt,
  };

  booksList.push(newBook);

  const isSuccess = booksList.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response(
        {
          status: 'success',
          message: 'Buku berhasil ditambahkan',
          data: {
            bookId: id,
          },
        },
    );
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const {reading, finished, name} = request.query;

  let books = booksList;
  let filteredBooks = [];

  if (reading || finished || name) {
    if (reading) {
      if (reading == 1) {
        filteredBooks = booksList.filter((book) => book.reading === true);
      } else {
        filteredBooks = booksList.filter((book) => book.reading === false);
      }
    };

    if (finished) {
      if (finished == 1) {
        filteredBooks = booksList.filter((book) => book.finished === true);
      } else {
        filteredBooks = booksList.filter((book) => book.finished === false);
      }
    };

    if (name) {
      filteredBooks = booksList.filter(
          (book) => new RegExp(name, 'i').test(book.name));
    }

    // ubah array json dengan map
    // jadi lebih spesifik respon yang ingin dikirim
    books = filteredBooks.map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
  } else {
    books = booksList.map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));
  }

  return {
    status: 'success',
    data: {
      books,
    },
  };
};

const getBookByIdHandler = (request, h) => {
  const {id} = request.params;
  const book = booksList.filter((b) => b.id === id)[0];
  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response(
      {
        status: 'fail',
        message: 'Buku tidak ditemukan',
      },
  );
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const {id} = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading} = request.payload;

  const updatedAt = new Date().toISOString();

  const index = booksList.findIndex((book) => book.id === id);
  const isName = request.payload.name;
  const isReadPageMoreThanPage = readPage > pageCount;

  if (!isName) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (isReadPageMoreThanPage) {
    const response = h.response({
      status: 'fail',
      // eslint-disable-next-line max-len
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  if (index !== -1) {
    booksList[index] = {
      ...booksList[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  };

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const {id} = request.params;

  const index = booksList.findIndex((book) => book.id === id);

  if (index !== -1) {
    booksList.splice(index, 1);
    const response = h.response(
        {
          status: 'success',
          message: 'Buku berhasil dihapus',
        },
    );
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler};
