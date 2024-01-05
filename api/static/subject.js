$(document).ready(function () {
  const baseUrl = "/api/v1/";
  const subjectsUpdateUrl = `${baseUrl}subject-update/`;
  const subjectsDeleteUrl = `${baseUrl}subject-delete/`;
  const subjectsCreateUrl = `${baseUrl}subject-create/`;
  const subjectsGetUrl = `${baseUrl}subject-detail/`;
  const subjectslistUrl = `${baseUrl}subject-list/`;

  let nextPageUrl = null;
  let prevPageUrl = null;

  $('#searchSubjectInput').on('input', function () {
    const searchText = $(this).val().toLowerCase();
    filterSubjects(searchText);
  });

  function filterSubjects(searchText) {
    const subjects = $('#subjectTableBody').find('tr');

    subjects.each(function () {
      const serialNumber = $(this).find('td:eq(0)').text().toLowerCase();
      const subjectName = $(this).find('td:eq(1)').text().toLowerCase();
      // Check if the column contains the search text
      if (subjectName.includes(searchText) || serialNumber.includes(searchText)) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  }

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

  function populateSubjects(url) {
    $.ajax({
      url: url || subjectslistUrl,
      method: "GET",
      success: function (response) {
        const subjects = response.results;
        addSubjectFields(subjects);
        nextPageUrl = response.next;
        prevPageUrl = response.previous;
        updatePaginationButtons();
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
          <button class="btn btn-sm btn-success action-btn update-btn" data-subject-id="${subject.id}" title="Update">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger action-btn delete-btn" data-subject-id="${subject.id}" title="Delete">
            <i class="fas fa-trash-alt"></i>
          </button>
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
        $("#updateSubjectBtn")
          .show()
          .click(function (event) {
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

  // Pagination buttons click handlers
  $("#nextPageSubjectBtn").click(function () {
    if (nextPageUrl) {
      populateSubjects(nextPageUrl);
    }
  });

  $("#prevPageSubjectBtn").click(function () {
    if (prevPageUrl) {
      populateSubjects(prevPageUrl);
    }
  });

  // Update pagination buttons state
  function updatePaginationButtons() {
    if (nextPageUrl) {
      $("#nextPageSubjectBtn").prop("disabled", false);
    } else {
      $("#nextPageSubjectBtn").prop("disabled", true);
    }

    if (prevPageUrl) {
      $("#prevPageSubjectBtn").prop("disabled", false);
    } else {
      $("#prevPageSubjectBtn").prop("disabled", true);
    }
  }


  populateSubjects();
});
