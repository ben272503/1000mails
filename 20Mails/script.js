
  const CLIENT_ID = '454242049005-78upa3iiobs9nu72avo3m5aeri7ptt7g.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyBnoXIDbrGoBJorZQWx1gT1XFHlWU-3oio';
  const SCOPES = 'https://www.googleapis.com/auth/gmail.send';
  const RECIPIENTS = ['benjamin24.joke@gmail.com', 'benjamins.vendee.globe@gmail.com'];

  const authorizeButton = document.getElementById('authorize_button');
  const sendButton = document.getElementById('send_button');
  const signoutButton = document.getElementById('signout_button');
  const previewButton = document.getElementById('preview_button');
  const statusDiv = document.getElementById('status');
  const previewDiv = document.getElementById('message-preview');
  const fileInput = document.getElementById('attachment');
  const previewFiles = document.getElementById('preview-files');

  let selectedFiles = [];
  let tokenClient;

  fileInput.addEventListener('change', () => {
    selectedFiles = Array.from(fileInput.files);
    updateFilePreview();
  });

  function updateFilePreview() {
    previewFiles.innerHTML = '';
    if (selectedFiles.length === 0) return;

    selectedFiles.forEach((file, index) => {
      const fileLine = document.createElement('div');
      fileLine.style.marginBottom = '4px';
      fileLine.innerHTML = `
        📎 ${file.name} (${Math.round(file.size / 1024)} Ko)
        <span style="color:red; cursor:pointer; margin-left:8px;" onclick="removeFile(${index})">❌</span>
      `;
      previewFiles.appendChild(fileLine);
    });
  }

  window.removeFile = function(index) {
    selectedFiles.splice(index, 1);
    updateFilePreview();
    if (selectedFiles.length === 0) fileInput.value = '';
  }

  function base64urlEncode(str) {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  function makeEmailWithAttachments(to, subject, message, files) {
    return new Promise((resolve, reject) => {
      const boundary = "boundary_" + Math.random().toString(36).substring(2);
      const readerPromises = files.map(file => new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          res({
            name: file.name,
            type: file.type || 'application/octet-stream',
            content: base64
          });
        };
        reader.onerror = rej;
        reader.readAsDataURL(file);
      }));

      Promise.all(readerPromises).then(attachments => {
        let email =
`To: ${to}
Subject: ${subject}
Content-Type: multipart/mixed; boundary="${boundary}"

--${boundary}
Content-Type: text/plain; charset="UTF-8"

${message}`;

        attachments.forEach(att => {
          email += `

--${boundary}
Content-Type: ${att.type}; name="${att.name}"
Content-Disposition: attachment; filename="${att.name}"
Content-Transfer-Encoding: base64

${att.content}`;
        });

        email += `\n--${boundary}--`;

        resolve(base64urlEncode(email));
      }).catch(reject);
    });
  }

  async function sendEmail() {
    const message = document.getElementById('message').value.trim();
    const files = selectedFiles;

    if (!message) {
      alert("Merci d'écrire un message.");
      return;
    }

    try {
      for (const to of RECIPIENTS) {
        const raw = files.length > 0
          ? await makeEmailWithAttachments(to, 'Message depuis mon site', message, files)
          : base64urlEncode(
              `To: ${to}\r\nSubject: Message depuis mon site\r\nContent-Type: text/plain; charset="UTF-8"\r\n\r\n${message}`
            );

        await gapi.client.gmail.users.messages.send({
          userId: 'me',
          resource: { raw }
        });
      }

      statusDiv.textContent = '✅ Emails envoyés avec succès !';
      statusDiv.style.color = 'green';
      previewDiv.textContent = '';
    } catch (e) {
      console.error(e);
      statusDiv.textContent = '❌ Erreur lors de l’envoi des emails.';
      statusDiv.style.color = 'red';
    }
  }

  function previewMessage() {
    const message = document.getElementById('message').value.trim();
    const files = selectedFiles;
    if (!message) {
      alert("Merci d'écrire un message.");
      return;
    }

    let previewText = `Aperçu du message à envoyer :\n\n${message}`;
    if (files.length > 0) {
      previewText += `\n\nPièces jointes :\n${files.map(f => `📎 ${f.name}`).join('\n')}`;
    }

    previewDiv.textContent = previewText;
    previewDiv.style.border = "1px solid #ccc";
    previewDiv.style.padding = "10px";
    previewDiv.style.marginTop = "10px";
    previewDiv.style.backgroundColor = "#fafafa";
  }

  function handleClientLoad() {
    gapi.load('client', initClient);
  }

  function initClient() {
    gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"]
    }).then(() => {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            gapi.client.setToken({ access_token: tokenResponse.access_token });
            updateSigninStatus(true);
          }
        }
      });

      signoutButton.onclick = signOut;

      updateSigninStatus(false);
      authorizeButton.onclick = () => tokenClient.requestAccessToken();
      sendButton.onclick = sendEmail;
      previewButton.onclick = previewMessage;
    }, (error) => {
      console.error(error);
      statusDiv.textContent = 'Erreur lors de l\'initialisation de l\'API.';
      statusDiv.style.color = 'red';
    });
  }

  function updateSigninStatus() {
    if (gapi.client.getToken() !== null) {
      authorizeButton.style.display = 'none';
      signoutButton.style.display = 'block';
      sendButton.disabled = false;

      statusDiv.textContent = '✅ Connecté à Gmail';
      statusDiv.style.color = 'green';
    } else {
      authorizeButton.style.display = 'block';
      sendButton.disabled = true;
      statusDiv.textContent = '❌ Non connecté.';
      statusDiv.style.color = 'red';
      signoutButton.style.display = 'none';

    }
  }

  function signOut() {
  google.accounts.oauth2.revoke(gapi.client.getToken().access_token, () => {
    gapi.client.setToken('');
    updateSigninStatus(false);
  });
}


  window.onload = handleClientLoad;
