import { ElMessageBox } from 'element-plus';
import i18next from 'i18next';
import _ from 'lodash';

/*
 * Build a message from a network error.
 * This is meant to be used in error dialogs.
 */
export function buildErrorMessage(error) {
  let title = 'An error occured';
  let text = 'Sorry, something went wrong.';

  const { response, message } = error;

  if (response) {
    const { data } = response;
    if (data && data.message) {
      if (i18next.exists(data.message)) {
        text = data.message;
      }
    } else {
      title = 'Network error';
      text = 'Unable to connect to server. Is your internet connection working?';
    }
  } else if (message && i18next.exists(message)) {
    text = message;
  }

  return {
    title: i18next.t(title),
    text: i18next.t(text, error.interpolation),
  };
}

/*
 * Build a message from a network error.
 * This is meant to be used in input fields.
 */
export function buildInputErrorMessage(error) {
  const { response } = error;
  if (!response) {
    return i18next.t('Network error');
  }

  const { data } = response;
  if (data && i18next.exists(data.message)) {
    return i18next.t(data.message);
  }

  return i18next.t('Something went wrong');
}


/*
 * Show an error modal to the user.
 * If an error is already showing, this message will be queued.
 * In case of multiple identical messages, only one will be shown.
 */
const errorQueue = [];
let showingError = false;

export function showError(e) {
  if (e) {
    // If an error object is supplied, add it to the queue unless it already is in there (no need to show the same error twice).
    const message = buildErrorMessage(e);
    if (!_.find(errorQueue, message)) {
      errorQueue.push(message);
    }
  }

  if (!showingError && errorQueue.length) {
    showingError = true;
    const message = errorQueue[errorQueue.length - 1];

    ElMessageBox.alert(message.text, message.title, {
      confirmButtonText: i18next.t('OK'),
    }).then(() => {
      showingError = false;
      errorQueue.pop();
      showError(); // Show next error. Won't show any if there is nothing in queue.
    });
  }

  return e;
}
