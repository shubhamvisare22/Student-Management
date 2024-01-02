$(document).ready(function () {
  let subjects = [];
  subjectCount = 5

  function populateSubjects() {
    const baseUrl = "/api/v1/";
    const subjectsUrl = `${baseUrl}subject-list/`;

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
    for (let i = 1; i <= 5; i++) {
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

  populateSubjects();

  $("#submitStudentBtn").click(function (event) {
    event.preventDefault();

    const baseUrl = "/api/v1/";
    const createStudentUrl = baseUrl + "student-create/";

    let name = $("#stuName").val();
    let roll_no = $("#stuRoll").val();
    let stu_cls = $("#stuclass").val();
    let fileInput = document.getElementById("stuPhoto");
    let file = fileInput.files[0];
    let token = $("input[name=csrfmiddlewaretoken]").val();


    if (name === "") {
      toastr.error("Please enter the student's name.");
      return;
    }

    if (roll_no === "" || roll_no === 0) {
      toastr.error("Please enter a valid roll number.");
      return;
    }

    if (stu_cls === "" || stu_cls === 0 || stu_cls >= 12) {
      toastr.error("Enter the student's class between 1-12.");
      return;
    }

    if (!file) {
      toastr.error("Please upload the student's photo.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("roll_no", roll_no);
    formData.append("photo", file);
    formData.append("stu_cls", stu_cls);
    formData.append('csrfmiddlewaretoken',token)

    const submittedSubjects = new Set(); // To store submitted subjects for uniqueness check

    for (let i = 1; i <= 5; i++) {
      const selectSubject = $(`#subject${i}`);
      const subject = selectSubject.val();
      const score = $(`#score${i}`).val();

      if (subject) {
        if (!submittedSubjects.has(subject)) {
          formData.append(`subject_scores[${i - 1}][subject]`, subject);
          formData.append(`subject_scores[${i - 1}][score]`, score);
          submittedSubjects.add(subject); // Add the subject to the set
        } else {
          toastr.error(`Please select a unique subject for Subject ${i}`);
          return;
        }
      } else {
        toastr.error(`Please select a subject for Subject ${i}`);
        return;
      }
    }

    // Check if all 5 subjects are added
    if (submittedSubjects.size !== 5) {
      toastr.error("Please add all five unique subjects with scores");
      return;
    }
    console.log(formData);
    $.ajax({
      url: createStudentUrl,
      method: "POST",
      data: formData,
      contentType: false,
      processData: false,
      enctype: "multipart/form-data",
      success: function (response) {
        console.log(response);
        $("#stuName").val("");
        $("#stuRoll").val("");
        $("#stuPhoto").val("");
        $("#stuclass").val("");

        for (let i = 1; i <= subjectCount; i++) {
          $(`#subject${i}`).val("");
          $(`#score${i}`).val("");
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
          text: "Student Roll Number must be unique",
        });
      },
    });
  });
});
