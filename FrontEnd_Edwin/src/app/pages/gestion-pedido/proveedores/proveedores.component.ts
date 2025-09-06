import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { Proveedor, ProveedorCreate, ProveedorUpdate,} from "../../../models/proveedor.model";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ProveedorService } from "../../../services/proveedor.service";
import * as XLSX from "xlsx";
import saveAs from "file-saver";

@Component({
  selector: "app-proveedores",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./proveedores.component.html",
  styleUrl: "./proveedores.component.css",
})
export class ProveedoresComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    "nombre", "apellido", "telefono", "correo", "empresa", "estado","acciones"
  ];
  dataSource = new MatTableDataSource<Proveedor>();

  loading = false;
  totalProveedores = 0;
  currentPage = 1;
  pageSize = 10;

  filtros = {
    busqueda: "",
    estado: "",
  };

  proveedorForm: FormGroup;
  editMode = false;
  selectedProveedor: Proveedor | null = null;
  mostrarDialogo = false;

  constructor(
    private proveedorService: ProveedorService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.proveedorForm = this.fb.group({
      nombre: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(80),
        ],
      ],
      apellido: ["", [Validators.maxLength(100)]], 
      direccion: ["", [Validators.maxLength(200)]],
      telefono: [
        "",
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(15),
        ],
      ],
      correo: [
        "",
        [Validators.required, Validators.email, Validators.maxLength(120)],
      ],
      empresa: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(120),
        ],
      ],
      estado: ["ACTIVO"], 
    });
  }

  ngOnInit(): void {
    this.cargarProveedores();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarProveedores(): void {
    this.loading = true;

    this.proveedorService
      .obtenerProveedores(this.currentPage, this.pageSize, this.filtros)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.dataSource.data = response.datos.datos;
            this.totalProveedores = response.datos.paginacion.total;
            this.loading = false;
          }
        },
        error: () => {
          this.loading = false;
          this.snackBar.open("Error al cargar proveedores", "Cerrar", {
            duration: 3000,
          });
        },
      });
  }

  aplicarFiltros(): void {
    this.currentPage = 1;
    this.cargarProveedores();
  }

  limpiarFiltros(): void {
    this.filtros = { busqueda: "", estado: "" };
    this.aplicarFiltros();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.cargarProveedores();
  }

  abrirDialogoProveedor(proveedor?: Proveedor): void {
    this.editMode = !!proveedor;
    this.selectedProveedor = proveedor || null;
    this.mostrarDialogo = true;

    if (proveedor) {
      this.proveedorForm.patchValue({
        nombre: proveedor.nombre,
        apellido: proveedor.apellido, 
        direccion: proveedor.direccion, 
        empresa: proveedor.empresa,
        correo: proveedor.correo,
        telefono: proveedor.telefono,
        estado: proveedor.estado,
      });
    } else {
      this.proveedorForm.reset({ estado: "ACTIVO" });
    }
  }

  guardarProveedor(): void {
    if (this.proveedorForm.valid) {
      const formData = this.proveedorForm.value;

      if (this.editMode && this.selectedProveedor) {
        // Actualizar proveedor
        const updateData: ProveedorUpdate = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          direccion: formData.direccion, 
          empresa: formData.empresa,
          correo: formData.correo,
          telefono: formData.telefono,
          estado: formData.estado,
        };

        this.proveedorService
          .actualizarProveedor(this.selectedProveedor.id, updateData)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open(
                  "Proveedor actualizado correctamente",
                  "Cerrar",
                  { duration: 3000 }
                );
                this.cargarProveedores();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(
                error.error?.mensaje || "Error al actualizar proveedor",
                "Cerrar",
                { duration: 3000 }
              );
            },
          });
      } else {
        // Crear proveedor
        const newProveedor: ProveedorCreate = {
          nombre: formData.nombre,
          apellido: formData.apellido, 
          direccion: formData.direccion, 
          empresa: formData.empresa,
          correo: formData.correo,
          telefono: formData.telefono,
          estado: formData.estado,
        };

        this.proveedorService.crearProveedor(newProveedor).subscribe({
          next: (response) => {
            if (response.ok) {
              this.snackBar.open("Proveedor creado correctamente", "Cerrar", {
                duration: 3000,
              });
              this.cargarProveedores();
              this.cerrarDialogo();
            }
          },
          error: (error) => {
            this.snackBar.open(
              error.error?.mensaje || "Error al crear proveedor",
              "Cerrar",
              { duration: 3000 }
            );
          },
        });
      }
    }
  }

  eliminarProveedor(proveedor: Proveedor): void {
    if (
      confirm(
        `¿Está seguro de que desea eliminar al proveedor ${proveedor.nombre}?`
      )
    ) {
      this.proveedorService.eliminarProveedor(proveedor.id).subscribe({
        next: (response) => {
          if (response.ok) {
            this.snackBar.open("Proveedor eliminado correctamente", "Cerrar", {
              duration: 3000,
            });
            this.cargarProveedores();
          }
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.mensaje || "Error al eliminar proveedor",
            "Cerrar",
            { duration: 3000 }
          );
        },
      });
    }
  }

  cerrarDialogo(): void {
    this.editMode = false;
    this.selectedProveedor = null;
    this.proveedorForm.reset();
    this.mostrarDialogo = false;
  }

  getEstadoClass(estado: string): string {
    return estado === "ACTIVO" ? "estado-activo" : "estado-inactivo";
  }

  exportarAExcel(): void {
    try {
      // Preparar los datos para exportar
      const datosParaExportar = this.dataSource.data.map((proveedor) => ({
        Nombre: proveedor.nombre,
        Apellido: proveedor.apellido,
        Dirección: proveedor.direccion,
        Teléfono: proveedor.telefono,
        "Correo Electrónico": proveedor.correo,
        Empresa: proveedor.empresa,
        Estado: proveedor.estado,
        "ID Proveedor": proveedor.id,
      }));

      // Crear el libro de trabajo
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(datosParaExportar);

      // Ajustar el ancho de las columnas
      const columnWidths = [
        { wch: 15 }, // Nombre
        { wch: 15 }, // Apellido
        { wch: 30 }, // Dirección
        { wch: 15 }, // Teléfono
        { wch: 25 }, // Correo
        { wch: 25 }, // Empresa
        { wch: 10 }, // Estado
        { wch: 12 }, // ID
      ];
      worksheet["!cols"] = columnWidths;

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(workbook, worksheet, "Proveedores");

      // Generar el archivo
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Crear nombre del archivo con fecha
      const fecha = new Date().toISOString().split("T")[0];
      const nombreArchivo = `Proveedores_TodoFarma_${fecha}.xlsx`;

      // Descargar el archivo
      saveAs(blob, nombreArchivo);

      // Mostrar mensaje de éxito
      this.snackBar.open(
        `Se exportaron ${datosParaExportar.length} proveedores a Excel`,
        "Cerrar",
        {
          duration: 3000,
        }
      );
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      this.snackBar.open("Error al exportar a Excel", "Cerrar", {
        duration: 3000,
      });
    }
  }
}
