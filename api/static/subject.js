$(document).ready(function () {
  const baseUrl = "/api/v1/";
  const subjectsUpdateUrl = `${baseUrl}subject-update/`;
  const subjectsDeleteUrl = `${baseUrl}subject-delete/`;
  const subjectsCreateUrl = `${baseUrl}subject-create/`;
  const subjectsGetUrl = `${baseUrl}subject-detail/`;
  const subjectslistUrl = `${baseUrl}subject-list/`;

  $("#submitSubjectBtn").click(function (event) {
    event.preventDefault();
    let subName = $("#subName").val();
    let token = $("input[name=csrfmiddlewaretoken]").val();

    if (!subName || subName === "") {
      toastr.error("Please enter the subject");
      return;
    }

    let formData = new FormData();
    formData.append("name", subName);
    formData.append("csrfmiddlewaretoken", token);

    $.ajax({
      url: subjectsCreateUrl,
      method: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        $("#subName").val("");
        populateSubjects();
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
      },
    });
  });

  function populateSubjects() {
    $.ajax({
      url: subjectslistUrl,
      method: "GET",
      success: function (response) {
        const subjects = response.results;
        addSubjectFields(subjects);
      },
      error: function (xhr, status, error) {
        console.error(xhr, status, error);
      },
    });
  }

  function addSubjectFields(subjects) {
    const subjectTableBody = $("#subjectTableBody");
    subjectTableBody.empty();

    subjects.forEach((subject, index) => {
      const row = createSubjectTableRow(subject, index + 1);
      subjectTableBody.append(row);
    });

    subjectTableBody.on("click", ".btn-success", function () {
      const subjectId = $(this).data("subject-id");
      populateUpdateForm(subjectId);
    });

    subjectTableBody.on("click", ".btn-danger", function () {
      const subjectId = $(this).data("subject-id");
      deleteSubject(subjectId);
    });
  }

  function createSubjectTableRow(subject, index) {
    return `
        <tr>
          <td>${index}</td>
          <td>${subject.name}</td>
          <td>
            <button class="btn btn-sm btn-success" data-subject-id="${subject.id}">Update</button>
            <button class="btn btn-sm btn-danger" data-subject-id="${subject.id}">Delete</button>
          </td>
        </tr>
      `;
  }

  function deleteSubject(subjectId) {
    $.ajax({
      url: `${subjectsDeleteUrl}${subjectId}/`,
      method: "DELETE",
      success: function (response) {
        populateSubjects();
      },
      error: function (xhr, status, error) {
        console.error(xhr, status, error);
      },
    });
  }

  function populateUpdateForm(subjectId) {
    $.ajax({
      url: subjectsGetUrl + subjectId,
      method: "GET",
      success: function (response) {
        $("#subName").val(response.name);
        $("#submitSubjectBtn").hide();
        $("#updateSubjectBtn").show().click(function (event) {
            event.preventDefault();
            const updatedSubjectId = $("#subjectId").val();
            updateSubject(updatedSubjectId);
            $("#submitSubjectBtn").show();
            $("#updateSubjectBtn").hide();
          });

        const hiddenSubjectIdField = `<input type="hidden" id="subjectId" name="subjectId" value="${subjectId}" />`;
        $("#sbjectForm").append(hiddenSubjectIdField);
      },
      error: function (xhr, status, error) {
        console.error(xhr, status, error);
      },
    });
  }

  function updateSubject(subjectId) {
    let subName = $("#subName").val();
    let token = $("input[name=csrfmiddlewaretoken]").val();

    if (!subName || subName === "") {
      toastr.error("Please enter the subject");
      return;
    }

    let formData = new FormData();
    formData.append("name", subName);
    formData.append("csrfmiddlewaretoken", token);

    $.ajax({
      url: `${subjectsUpdateUrl}${subjectId}/`,
      method: "PUT",
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        $("#subName").val("");
        populateSubjects();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Data updated successfully.",
        });
      },
      error: function (xhr, status, error) {
        console.error(xhr, status, error);
      },
    });
  }

  populateSubjects();
});
