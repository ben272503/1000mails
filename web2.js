 let fileData = null;

    const dropArea = document.getElementById("drop-area");
    const fileInfo = document.getElementById("file-info");
    const progressBar = document.getElementById("progress-bar").querySelector("span");

    // Prévenir les comportements par défaut pour les événements de glisser-déposer
    ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Ajouter ou retirer la classe 'highlight' lors du survol
    dropArea.addEventListener("dragover", () => dropArea.classList.add("highlight"));
    dropArea.addEventListener("dragleave", () => dropArea.classList.remove("highlight"));
    dropArea.addEventListener("drop", handleDrop);

    function handleDrop(e) {
      dropArea.classList.remove("highlight");
      const dt = e.dataTransfer;
      const files = dt.files;

      if (files.length > 0) {
        const file = files[0];
        if (!file.name.match(/\.(csv|xlsx)$/)) {
          alert("Veuillez déposer un fichier CSV ou XLSX valide.");
          return;
        }
        const reader = new FileReader();
        reader.onload = function (event) {
          const data = event.target.result;
          let rows = [];
          if (file.name.endsWith('.csv')) {
            const text = data;
            const lines = text.split("\n").filter(line => line.trim() !== "");
            const headers = lines[0].split(",");
            const nomIndex = headers.findIndex(h => h.trim().toLowerCase() === "nom");
            const emailIndex = headers.findIndex(h => h.trim().toLowerCase() === "email");
            rows = lines.slice(1).map(line => {
              const values = line.split(",");
              return {
                nom: values[nomIndex],
                email: values[emailIndex]
              };
            });
          } else if (file.name.endsWith('.xlsx')) {
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const headers = json[0];
            const nomIndex = headers.findIndex(h => h.trim().toLowerCase() === "nom");
            const emailIndex = headers.findIndex(h => h.trim().toLowerCase() === "email");
            rows = json.slice(1).map(row => ({
              nom: row[nomIndex],
              email: row[emailIndex]
            }));
          }

          fileData = rows;
          fileInfo.innerHTML = `Fichier chargé : ${file.name} <button onclick="removeFile()">Supprimer</button>`;
        };
        reader.readAsBinaryString(file);
      }
    }

    function removeFile() {
      fileData = null;
      fileInfo.innerHTML = "";
    }

    function validateEmail(email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    }

    function sendMail(target) {
  const bodyTemplate = document.getElementById("message").value.trim();
  const subject = document.getElementById("objet").value.trim();
  if (!bodyTemplate || !subject || !fileData || fileData.length === 0) {
    alert("Erreur : Veuillez remplir le champ objet, le corps du message et charger un fichier CSV.");
    return;
  }
  alert("Les mails sont en cours d'envoi...");
  let sentCount = 0;
  const sendEmail = (entry) => {
    return new Promise((resolve) => {
      const name = entry.nom;
      const email = entry.email;
      if (!validateEmail(email)) {
        console.warn(`Email invalide : ${email}`);
        resolve(); // Résoudre la promesse même si l'email est invalide
        return;
      }
      const personalized = bodyTemplate.replace(/\[nom\]/g, name);
      sendTo(target, email, subject, personalized);
      sentCount++;
      const progress = Math.round((sentCount / fileData.length) * 100);
      progressBar.style.width = `${progress}%`;
      resolve(); // Résoudre la promesse après l'envoi
    });
  };
  const sendAllEmails = async () => {
    for (const entry of fileData) {
      await sendEmail(entry);
      await new Promise(resolve => setTimeout(resolve, 500)); // Attendre 500 ms entre chaque envoi
    }
    alert("Tous les mails ont été traités (ouverts dans votre client de messagerie).");
  };
  sendAllEmails();
}

    function sendTo(target, email, subject, body) {
  const encodedEmail = encodeURIComponent(email);
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);

  if (target === "gmail") {
    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedEmail}&su=${encodedSubject}&body=${encodedBody}`;
    window.open(gmailURL, '_blank'); // Ouvre dans un nouvel onglet
  } else if (target === "outlook") {
    const outlookURL = `mailto:${encodedEmail}?subject=${encodedSubject}&body=${encodedBody}`;
    window.open(outlookURL, '_blank'); // Ouvre dans un nouvel onglet
  }
}

    //_____________________________________________________________________________________________________________________________
    const fileInput = document.getElementById("file-input");
const uploadButton = document.getElementById("upload-button");

uploadButton.addEventListener("click", () => {
  fileInput.click(); // Trigger the file input click
});

fileInput.addEventListener("change", (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    handleFile(files[0]); // Handle the selected file
  }
});

function handleFile(file) {
  if (!file.name.match(/\.(csv|xlsx)$/)) {
    alert("Veuillez sélectionner un fichier CSV ou XLSX valide.");
    return;
  }
  const reader = new FileReader();
  reader.onload = function (event) {
    const data = event.target.result;
    let rows = [];
    if (file.name.endsWith('.csv')) {
      const text = data;
      const lines = text.split("\n").filter(line => line.trim() !== "");
      const headers = lines[0].split(",");
      const nomIndex = headers.findIndex(h => h.trim().toLowerCase() === "nom");
      const emailIndex = headers.findIndex(h => h.trim().toLowerCase() === "email");
      rows = lines.slice(1).map(line => {
        const values = line.split(",");
        return {
          nom: values[nomIndex],
          email: values[emailIndex]
        };
      });
    } else if (file.name.endsWith('.xlsx')) {
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const headers = json[0];
      const nomIndex = headers.findIndex(h => h.trim().toLowerCase() === "nom");
      const emailIndex = headers.findIndex(h => h.trim().toLowerCase() === "email");
      rows = json.slice(1).map(row => ({
        nom: row[nomIndex],
        email: row[emailIndex]
      }));
    }

    fileData = rows;
    fileInfo.innerHTML = `Fichier chargé : ${file.name} <button onclick="removeFile()">Supprimer</button>`;
  };
  reader.readAsBinaryString(file);
}
