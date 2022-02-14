const titleInput = document.querySelector("#title");
const authorInput = document.querySelector("#author");
const yearInput = document.querySelector("#year");
const genreInput = document.querySelector("#genre");
const formInputs = [titleInput, authorInput, yearInput];

document.addEventListener("DOMContentLoaded", function () {
  formInputs.forEach((inputElement) => {
    inputElement.nextElementSibling.innerText = `Maximum character: ${inputElement.maxLength}`;
  });

  const addBookForm = document.querySelector("#addBookForm");

  addBookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (document.querySelector("#status").value === "true") {
      addNewBookToTheList(true);
    } else {
      addNewBookToTheList(false);
    }
    document.querySelector("#search").scrollIntoView({ behavior: "smooth", block: "start", inline: "center" });
    titleInput.value = "";
    authorInput.value = "";
    yearInput.value = "";

    setWebsiteBottomPart();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  document.querySelector(".in-progress").classList.add("selected");
});

document.addEventListener("ondatasaved", () => {
  const statusNotification = document.createElement("div");
  statusNotification.classList.add("pop-up");
  statusNotification.innerText = "Data successfully updated";
  document.body.append(statusNotification);
  setTimeout(() => {
    statusNotification.style.opacity = "1";
  }, 1);
  setTimeout(() => {
    statusNotification.style.opacity = "0";
    setTimeout(() => {
      statusNotification.remove();
    }, 400);
  }, 800);
});
document.addEventListener("ondataloaded", () => {
  populateBookElement();
});

for (i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", (event) => {
    const inputElement = event.currentTarget;
    const typedCharacter = inputElement.value.length;
    const maxInput = inputElement.maxLength;
    const remainingCharacter = maxInput - typedCharacter;
    const characterInfo = inputElement.nextElementSibling;
    characterInfo.innerText = remainingCharacter;
    if (remainingCharacter === 0) {
      characterInfo.innerText = "Maximum title character have been reached!";
    } else if (remainingCharacter === maxInput) {
      characterInfo.innerText = `Maximum character: ${inputElement.maxLength}`;
    } else if (remainingCharacter <= 6) {
      if (inputElement === titleInput || inputElement === authorInput) {
        characterInfo.style.color = "#ff75b1";
      } else {
        characterInfo.style.color = "#fda479";
      }
      characterInfo.innerText = `Character left: ${remainingCharacter}`;
    } else {
      characterInfo.style.color = "#fda479";
      characterInfo.innerText = `Character left: ${remainingCharacter}`;
    }
    checkForm();
  });
}

formInputs.forEach((inputElement) => {
  inputElement.addEventListener("focus", function () {
    inputElement.nextElementSibling.style.display = "block";
    setTimeout(() => {
      inputElement.nextElementSibling.style.opacity = "1";
    }, 1);
  });
});

formInputs.forEach((inputElement) => {
  inputElement.addEventListener("blur", function () {
    inputElement.nextElementSibling.style.opacity = "0";
    setTimeout(() => {
      inputElement.nextElementSibling.style.display = "none";
    }, 400);
  });
});

function checkForm() {
  if (titleInput.value.length > 0 && authorInput.value.length > 0 && yearInput.value.length > 0) {
    document.querySelector(".submit").removeAttribute("disabled");
  } else {
    document.querySelector(".submit").setAttribute("disabled", "");
  }
}

const openFormButton = document.querySelector(".open-form");
const websiteBottomPart = document.querySelector(".bottom");
const controlBottomOverlay = document.querySelector(".form-toggle");

openFormButton.onclick = () => {
  websiteBottomPart.style.top = "1680px";
  controlBottomOverlay.classList.add("active");
};

controlBottomOverlay.onclick = () => {
  if (controlBottomOverlay.classList.contains("active")) {
    websiteBottomPart.style.top = "720px";
    document.querySelector(".wrapper").style.height = "1680px";
  } else {
    websiteBottomPart.style.top = "1680px";
    document.querySelector(".wrapper").style.height = "2000px";
  }
  controlBottomOverlay.classList.toggle("active");
};

const inProgressButton = document.querySelector(".in-progress");
const completedButton = document.querySelector(".completed");

inProgressButton.onclick = () => {
  if (completedButton.classList.contains("selected")) {
    completedButton.classList.toggle("selected");
  }
  inProgressButton.classList.toggle("selected");

  document.querySelector(".in-progress-books").style.zIndex = "4";
  document.querySelector(".completed-books").style.zIndex = "3";
};

completedButton.onclick = () => {
  if (inProgressButton.classList.contains("selected")) {
    inProgressButton.classList.toggle("selected");
  }
  completedButton.classList.toggle("selected");

  document.querySelector(".completed-books").style.zIndex = "4";
  document.querySelector(".in-progress-books").style.zIndex = "3";
};

function createEditButton(buttonType, eventListener) {
  const editButton = document.createElement("div");
  editButton.classList.add(buttonType);

  editButton.addEventListener("click", function (event) {
    eventListener(event);
  });

  return editButton;
}

function addNewBookToTheList(isComplete) {
  const title = titleInput.value;
  const author = authorInput.value;
  const year = yearInput.value;
  const genreValue = genreInput.value;

  const newBook = createBook(title, author, year, genreValue, isComplete);
  const newBookObject = composeBookObject(title, author, year, genreValue, isComplete);

  newBook[BOOK_ITEMID] = newBookObject.id;
  bookObjects.push(newBookObject);

  if (isComplete) {
    document.querySelector(".completed-books").appendChild(newBook);
  } else {
    document.querySelector(".in-progress-books").appendChild(newBook);
  }

  updateDataToStorage();
}

function addBookToCompletedList(bookElement) {
  const title = bookElement.querySelector(".book-title").innerText;
  const author = bookElement.querySelector(".book-author").innerText;
  const year = bookElement.querySelector(".book-year").innerText;
  const genreValue = bookElement.classList[1];

  const createCompletedBook = createBook(title, author, year, genreValue, true);
  const bookObject = findBook(bookElement[BOOK_ITEMID]);

  bookObject.isComplete = true;
  createCompletedBook[BOOK_ITEMID] = bookObject.id;

  const bookCompletedList = document.querySelector(".completed-books");
  bookCompletedList.appendChild(createCompletedBook);
  bookElement.remove();

  setWebsiteBottomPart();
  updateDataToStorage();
}

function undoBookFromCompletedList(bookElement) {
  const title = bookElement.querySelector(".book-title").innerText;
  const author = bookElement.querySelector(".book-author").innerText;
  const year = bookElement.querySelector(".book-year").innerText;
  const genreValue = bookElement.classList[1];

  const createInProgressBook = createBook(title, author, year, genreValue, false);

  const bookObject = findBook(bookElement[BOOK_ITEMID]);
  bookObject.isComplete = false;
  createInProgressBook[BOOK_ITEMID] = bookObject.id;

  const bookInProgressList = document.querySelector(".in-progress-books");
  bookInProgressList.appendChild(createInProgressBook);
  bookElement.remove();

  setWebsiteBottomPart();
  updateDataToStorage();
}

function createCompletedButton() {
  return createEditButton("completed-button", (event) => {
    addBookToCompletedList(event.target.parentElement);
  });
}

function removeBookFromTheList(bookElement) {
  const bookPosition = findBookIndex(bookElement[BOOK_ITEMID]);
  bookObjects.splice(bookPosition, 1);

  bookElement.remove();
  setWebsiteBottomPart();
  updateDataToStorage();
}

function deleteBookConfirmation(bookTitle, bookListContainer, bookElement) {
  if (bookListContainer === "in-progress-books") {
    bookListContainer = "in-progress";
  } else {
    bookListContainer = "completed";
  }
  const confirmationContainer = document.createElement("div");
  confirmationContainer.classList.add("confirmation-container");
  const confirmationWrapper = document.createElement("div");
  confirmationWrapper.classList.add("confirmation-wrapper");
  confirmationContainer.append(confirmationWrapper);

  const confirmationDialog = document.createElement("p");
  confirmationDialog.innerText = `Are you sure to delete "${bookTitle}" from your ${bookListContainer} book list?`;
  confirmationWrapper.append(confirmationDialog);
  const confirmationButtons = document.createElement("div");
  confirmationButtons.classList.add("confirmation-buttons");
  confirmationWrapper.append(confirmationButtons);

  const noButton = document.createElement("div");
  noButton.classList.add("no");
  noButton.innerText = "No";
  noButton.onclick = () => {
    document.querySelector(".confirmation-container").remove();
    document.querySelector(".dim").style.display = "none";
  };
  confirmationButtons.append(noButton);
  const yesButton = document.createElement("div");
  yesButton.classList.add("yes");
  yesButton.innerText = "Yes";
  yesButton.onclick = () => {
    removeBookFromTheList(bookElement);
    document.querySelector(".confirmation-container").remove();
    document.querySelector(".dim").style.display = "none";
  };
  confirmationButtons.append(yesButton);

  document.body.append(confirmationContainer);
}

function createRemoveButton(isComplete) {
  if (isComplete) {
    return createEditButton("remove-completed-button", (event) => {
      deleteBookConfirmation(event.target.parentElement.querySelector(".book-title").innerText, event.target.parentElement.parentElement.getAttribute("class"), event.target.parentElement);
      document.querySelector(".dim").style.display = "block";
    });
  } else {
    return createEditButton("remove-in-progress-button", (event) => {
      deleteBookConfirmation(event.target.parentElement.querySelector(".book-title").innerText, event.target.parentElement.parentElement.getAttribute("class"), event.target.parentElement);
      document.querySelector(".dim").style.display = "block";
    });
  }
}

function createUndoButton() {
  return createEditButton("undo-button", (event) => {
    undoBookFromCompletedList(event.target.parentElement);
  });
}

function createBookLayout(title, author, year, genreValue) {
  const bookElement = document.createElement("div");
  bookElement.classList.add("book");
  bookElement.classList.add(genreValue);

  const bookTitleContainer = document.createElement("div");
  bookTitleContainer.classList.add("book-title-container");
  const bookTitle = document.createElement("p");
  bookTitle.classList.add("book-title");
  bookTitle.innerText = title;
  bookTitleContainer.appendChild(bookTitle);
  bookElement.appendChild(bookTitleContainer);

  const bookIllustration = document.createElement("img");
  bookIllustration.setAttribute("src", `asset/${genreValue}.png`);
  bookIllustration.setAttribute("alt", "book illustration");
  bookIllustration.classList.add("book-illustration");
  bookElement.appendChild(bookIllustration);

  const bookInformation = document.createElement("div");
  bookInformation.classList.add("book-information");
  bookElement.appendChild(bookInformation);

  const bookAuthorcontainer = document.createElement("div");
  bookAuthorcontainer.classList.add("book-author-container");
  const bookAuthor = document.createElement("p");
  bookAuthor.classList.add("book-author");
  bookAuthor.innerText = author;
  bookAuthorcontainer.appendChild(bookAuthor);
  bookInformation.appendChild(bookAuthorcontainer);
  const bookYear = document.createElement("p");
  bookYear.classList.add("book-year");
  bookYear.innerText = year;
  bookInformation.appendChild(bookYear);

  return bookElement;
}

function createBook(title, author, year, genreValue, isComplete) {
  const bookElement = createBookLayout(title, author, year, genreValue);

  if (isComplete) {
    bookElement.append(createRemoveButton(isComplete), createUndoButton());
    bookElement.addEventListener("mouseover", () => {
      setTimeout(() => {
        bookElement.querySelector(".undo-button").style.opacity = "1";
        bookElement.querySelector(".remove-completed-button").style.opacity = "1";
      }, 1);
    });
    bookElement.addEventListener("mouseout", () => {
      bookElement.querySelector(".undo-button").style.opacity = "0";
      bookElement.querySelector(".remove-completed-button").style.opacity = "0";
    });
  } else {
    bookElement.append(createRemoveButton(), createCompletedButton());
    bookElement.addEventListener("mouseover", () => {
      setTimeout(() => {
        bookElement.querySelector(".remove-in-progress-button").style.opacity = "1";
        bookElement.querySelector(".completed-button").style.opacity = "1";
      }, 1);
    });
    bookElement.addEventListener("mouseout", () => {
      bookElement.querySelector(".remove-in-progress-button").style.opacity = "0";
      bookElement.querySelector(".completed-button").style.opacity = "0";
    });
  }

  return bookElement;
}

document.querySelector("#search").addEventListener("keyup", () => {
  const searchBarElement = document.querySelector("#search");

  const searchInput = searchBarElement.value;
  standardizedInput = searchInput.toLowerCase();

  const bookElements = document.querySelectorAll(".book");

  for (i = 0; i < bookElements.length; i++) {
    if (bookElements[i].querySelector(".book-title").innerText.toLowerCase().includes(standardizedInput)) {
      bookElements[i].style.display = "block";
    } else {
      bookElements[i].style.display = "none";
    }
  }
});
