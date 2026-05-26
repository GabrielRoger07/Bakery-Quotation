package com.bakeryquotation.backend.Department.DTO;

public class DepartmentResponseDTO {

    private Long departmentId;
    private String departmentName;
    private String companyCnpj;

    public DepartmentResponseDTO() {
    }

    public DepartmentResponseDTO(Long departmentId, String departmentName, String companyCnpj) {
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.companyCnpj = companyCnpj;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getCompanyCnpj() {
        return companyCnpj;
    }

    public void setCompanyCnpj(String companyCnpj) {
        this.companyCnpj = companyCnpj;
    }
}
