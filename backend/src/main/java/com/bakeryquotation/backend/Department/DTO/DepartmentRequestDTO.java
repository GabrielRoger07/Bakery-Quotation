package com.bakeryquotation.backend.Department.DTO;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class DepartmentRequestDTO {

    @NotNull(message = "Department name is required")
    @NotEmpty(message = "Department name cannot be empty")
    private String departmentName;

    public DepartmentRequestDTO() {
    }

    public DepartmentRequestDTO(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }
}
