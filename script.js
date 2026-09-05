const WEB_APP_URL =
"https://script.google.com/macros/s/AKfycbwVtHOfdgzOrVYHuoXOe45v70Cgo6dHnnL_1gztcQGMdd_cuJDBKLA_ZGdt6hqotkzt8g/exec";

const classDropdown = document.getElementById("studentClass");

classDropdown.addEventListener("change", loadFees);

async function loadFees() {

    const studentClass =
        document.getElementById("studentClass").value;

    if(studentClass === "")
        return;

    const response = await fetch(
        `${WEB_APP_URL}?action=fees&studentClass=${encodeURIComponent(studentClass)}`
    );

    const data = await response.json();

    document.getElementById("educationFee").value =
        data.educationFee;

    document.getElementById("hostelFee").value =
        data.hostelFee;

    document.getElementById("totalFee").value =
        Number(data.educationFee) + Number(data.hostelFee);
}

async function saveStudent(formData) {

    try {

        const response = await fetch(WEB_APP_URL, {

            method: "POST",

            body: JSON.stringify({

                action: "saveStudent",

                student: formData

            })

        });

        const result = await response.json();

        console.log("Save result:", result);

        if (!result.success) {

            alert(
                result.error ||
                "Failed to save student."
            );

            return;
        }

        // Show success message
        alert(
            "Student saved successfully.\n" +
            "PDF generated successfully."
        );

        // Automatically download PDF
        if (result.downloadUrl) {

            const downloadLink =
                document.createElement("a");

            downloadLink.href =
                result.downloadUrl;

            downloadLink.download =
                formData.childName +
                "_Student_Sponsorship_Profile.pdf";

            downloadLink.style.display = "none";

            document.body.appendChild(downloadLink);

            downloadLink.click();

            document.body.removeChild(downloadLink);
        }

    } catch (error) {

        console.error(
            "Save error:",
            error
        );

        alert(
            "Something went wrong while saving the student."
        );
    }
}


document.getElementById("studentForm").addEventListener("submit", async function(e){

    e.preventDefault();

    const formData = {

        childName: document.getElementById("childName").value,
        dob: document.getElementById("dob").value,
        academicYear: document.getElementById("academicYear").value,
        studentClass: document.getElementById("studentClass").value,
        nativePlace: document.getElementById("nativePlace").value,

        fatherName: document.getElementById("fatherName").value,
        fatherOccupation: document.getElementById("fatherOccupation").value,
        fatherIncome: document.getElementById("fatherIncome").value,

        motherName: document.getElementById("motherName").value,
        motherOccupation: document.getElementById("motherOccupation").value,
        motherIncome: document.getElementById("motherIncome").value,

        address: document.getElementById("address").value,

        schoolName: document.getElementById("schoolName").value,
        schoolAddress: document.getElementById("schoolAddress").value,
        contactPerson: document.getElementById("contactPerson").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,

        siblings: document.getElementById("siblings").value,
        familyHistory: document.getElementById("familyHistory").value,

        educationFee: document.getElementById("educationFee").value,
        hostelFee: document.getElementById("hostelFee").value,
        totalFee: document.getElementById("totalFee").value

    };

    const studentPhoto = await uploadPhoto("studentPhoto");

formData.studentPhotoUrl = studentPhoto ? studentPhoto.fileUrl : "";

const schoolPhoto = await uploadPhoto("schoolPhoto");

formData.schoolPhotoUrl = schoolPhoto ? schoolPhoto.fileUrl : "";

console.log(formData);
console.log(
    "Photo URL being saved:",
    formData.studentPhotoUrl
);
await saveStudent(formData);

});



function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = function(e) {

            const img = new Image();

            img.onload = function() {

                const maxWidth = 1000;
                const maxHeight = 1000;

                let width = img.width;
                let height = img.height;

                // Resize while maintaining aspect ratio
                if (width > maxWidth || height > maxHeight) {

                    const ratio = Math.min(
                        maxWidth / width,
                        maxHeight / height
                    );

                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );

                // Convert to JPEG
                const dataUrl = canvas.toDataURL(
                    "image/jpeg",
                    0.85
                );

                const base64 =
                    dataUrl.split(",")[1];

                resolve({
                    base64: base64,
                    mimeType: "image/jpeg"
                });

            };

            img.onerror = reject;

            img.src = e.target.result;
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}




async function uploadPhoto(inputId) {

    const file =
        document.getElementById(inputId).files[0];

    if (!file) return null;

    const imageData =
        await fileToBase64(file);

    const response =
        await fetch(WEB_APP_URL, {

            method: "POST",

            body: JSON.stringify({

                action: "uploadImage",

                fileName: file.name,

                mimeType: imageData.mimeType,

                base64: imageData.base64

            })

        });

    const result =
        await response.json();

    console.log("Upload result:", result);

    return result;
}

