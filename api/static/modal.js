const subjectCount = 5;
let subjects = [];

const baseUrl = "/api/v1/";
const subjectsUrl = `${baseUrl}subject-list/`;

function populateSubjects() {
  $.ajax({
    url: subjectsUrl,
    method: "GET",
    success: function (response) {
      subjects = response.results;
      addSubjectFields();
    },
    error: function (xhr, status, error) {
      console.error(xhr, status, error);
    },
  });
}


 function addSubjectFields() {
    const subjectFields = $("#subjectFields");
    for (let i = 1; i <= subjectCount; i++) {
      const subjectField = `
        <div class="form-group">
          <label for="subject${i}">Subject ${i}</label>
          <select class="form-control" id="subject${i}">
            <option value="">Select Subject</option>
            ${subjects
              .map(
                (subject) =>
                  `<option value="${subject.id}">${subject.name}</option>`
              )
              .join("")}
          </select>
          <input type="number" class="form-control" id="score${i}" placeholder="Score" />
        </div>
      `;
      subjectFields.append(subjectField);
    }
  }
$(document).ready(function () {
 

  populateSubjects();
});

function validateForm() {
  const name = $("#stuName").val();
  const roll_no = $("#stuRoll").val();
  const stu_cls = $("#stuclass").val();
  const file = document.getElementById("stuPhoto").files[0];

  if (name === "") {
    return "Please enter the student's name.";
  }

  if (roll_no === "" || roll_no === 0) {
    return "Please enter a valid roll number.";
  }

  if (stu_cls === "" || stu_cls === 0 || stu_cls >= 12) {
    return "Enter the student's class between 1-12.";
  }

  if (!file) {
    return "Please upload the student's photo.";
  }

  const submittedSubjects = new Set();
  const subjectCount = 5;

  for (let i = 1; i <= subjectCount; i++) {
    const selectSubject = $(`#subject${i}`);
    const subject = selectSubject.val();
    const score = $(`#score${i}`).val();

    //   if (subject) {
    //     if (!submittedSubjects.has(subject)) {
    //       submittedSubjects.add(subject);
    //     } else {
    //       return `Please select a unique subject for Subject ${i}`;
    //     }
    //   } else {
    //     return `Please select a subject for Subject ${i}`;
    //   }
  }

  // if (submittedSubjects.size !== subjectCount) {
  //   return "Please add all five unique subjects with scores";
  // }

  return ""; // Return empty string if all validations pass
}

$("#submitStudentBtn").click(function (event) {
  event.preventDefault();

  const validationMsg = validateForm();

  if (validationMsg !== "") {
    toastr.error(validationMsg);
    return;
  }

  const formData = new FormData();
  const fileInput = document.getElementById("stuPhoto");
  const file = fileInput.files[0];
  const token = $("input[name=csrfmiddlewaretoken]").val();

  formData.append("name", $("#stuName").val());
  formData.append("roll_no", $("#stuRoll").val());
  formData.append("stu_cls", $("#stuclass").val());
  formData.append("photo", file);
  formData.append("csrfmiddlewaretoken", token);

  const subjectsAndScores = [];
  const subjectCount = 5;

  for (let i = 1; i <= subjectCount; i++) {
    const subject = $(`#subject${i}`).val();
    const score = $(`#score${i}`).val();

    if (subject && score) {
      subjectsAndScores.push({ subject, score });
    } else {
      toastr.error(`Please enter both subject and score for Subject ${i}`);
      return;
    }
  }

  formData.append("subjects", JSON.stringify(subjectsAndScores));

  console.log(formData);
  const baseUrl = "/api/v1/";
  const createStudentUrl = `${baseUrl}student-create/`;

  $.ajax({
    url: createStudentUrl,
    method: "POST",
    data: formData,
    contentType: false,
    processData: false,
    success: function (response) {
      $("#stuName, #stuRoll, #stuPhoto, #stuclass").val("");

      for (let i = 1; i <= subjectCount; i++) {
        $(`#subject${i}, #score${i}`).val("");
      }

      $("#studentCreationModal").modal("hide");

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Data submitted successfully.",
      });
    },
    error: function (xhr, status, error) {
      console.error(xhr);
      console.error(status);
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
      });
    },
  });
});
