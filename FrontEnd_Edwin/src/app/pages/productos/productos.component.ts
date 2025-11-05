import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { CategoriaService } from '../../services/categoria.service';
import { ProductoService } from '../../services/producto.service';
import { MarcaService, Marca, MarcaFiltros } from '../../services/marca.service';
import { Categoria, CategoriaCreate, CategoriaUpdate } from '../../models/categoria.model';
import { Producto, ProductoCreate, ProductoUpdate } from '../../models/producto.model';
import { ConfirmDialogComponent } from '../../components/confirm-dialog.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './productos.component.html'
})
export class ProductosComponent implements OnInit {
  @ViewChild('categoriaPaginator') categoriaPaginator!: MatPaginator;
  @ViewChild('productoPaginator') productoPaginator!: MatPaginator;
  @ViewChild('categoriaSort') categoriaSort!: MatSort;
  @ViewChild('productoSort') productoSort!: MatSort;

  // Variables para categorías
  categorias: Categoria[] = [];
  categoriasDataSource = new MatTableDataSource<Categoria>();
  categoriasDisplayedColumns = ['nombre', 'descripcion', 'activo', 'created_at', 'acciones'];
  categoriaForm!: FormGroup;
  categoriaEditando: Categoria | null = null;
  categoriaModalAbierto = false;
  categoriaCargando = false;
  categoriaTotal = 0;
  categoriaPagina = 1;
  categoriaLimite = 10;
  categoriaFiltros = {
    activo: 'true',
    busqueda: ''
  };

  // Variables para productos
  productos: Producto[] = [];
  productosDataSource = new MatTableDataSource<Producto>();
  productosDisplayedColumns = ['nombre', 'sku', 'categoria_nombre', 'marca_nombre', 'precio_unitario', 'stock', 'fecha_vencimiento', 'activo', 'acciones'];
  productoForm!: FormGroup;
  productoEditando: Producto | null = null;
  productoModalAbierto = false;
  productoCargando = false;
  productoTotal = 0;
  productoPagina = 1;
  productoLimite = 10;
  productoFiltros = {
    activo: '',
    id_categoria: '',
    busqueda: ''
  };
  categoriasParaDropdown: Categoria[] = [];

  // Variables para marcas
  marcas: Marca[] = [];
  marcasDataSource = new MatTableDataSource<Marca>();
  marcasDisplayedColumns = ['nombre', 'descripcion', 'activo', 'created_at', 'acciones'];
  marcaForm!: FormGroup;
  marcaModalAbierto = false;
  marcaEditando: Marca | null = null;
  marcaCargando = false;
  marcaPagina = 1;
  marcaLimite = 10;
  marcaTotal = 0;
  marcaFiltros: MarcaFiltros = {
    activo: '',
    busqueda: ''
  };
  marcasParaDropdown: { id_marca: number; nombre: string }[] = [];

  // Variables generales
  tabSeleccionado = 0;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private marcaService: MarcaService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.cargarCategoriasActivas();
    this.cargarCategorias();
    this.cargarProductos();
    this.cargarMarcasActivas();
    this.cargarMarcas();
  }

  inicializarFormularios(): void {
    // Formulario de categoría
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(255)]],
      activo: [true]
    });

    // Formulario de producto
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(140)]],
      descripcion: ['', [Validators.maxLength(500)]],
      sku: ['', [Validators.maxLength(40)]],
      codigo_barras: ['', [Validators.maxLength(64)]],
      id_categoria: ['', [Validators.required]],
      id_marca: ['', [Validators.required]],
      precio_unitario: [0, [Validators.min(0)]],
      stock: [0, [Validators.min(0)]],
      fecha_vencimiento: [''],
      activo: [true]
    });

    // Formulario de marca
    this.marcaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      descripcion: ['', [Validators.maxLength(255)]],
      activo: [true]
    });
  }

  // Métodos para categorías
  cargarCategorias(): void {
    this.categoriaCargando = true;
    this.categoriaService.obtenerCategorias(this.categoriaPagina, this.categoriaLimite, this.categoriaFiltros)
      .subscribe({
        next: (response) => {
          const categorias = response.datos.datos || [];
          let total = response.datos.paginacion?.total || 0;
          
          // WORKAROUND: Si el backend devuelve total=0 pero hay datos
          if (total === 0 && categorias.length > 0) {
            if (categorias.length === this.categoriaLimite) {
              total = this.categoriaPagina * this.categoriaLimite + 1;
            } else {
              total = (this.categoriaPagina - 1) * this.categoriaLimite + categorias.length;
            }
          }
          
          this.categorias = categorias;
          this.categoriasDataSource.data = this.categorias;
          this.categoriaTotal = total;
          this.categoriaCargando = false;
        },
        error: (error) => {
          console.error('Error al cargar categorías:', error);
          this.snackBar.open('Error al cargar categorías', 'Cerrar', { duration: 3000 });
          this.categoriaCargando = false;
        }
      });
  }

  cargarCategoriasActivas(): void {
    this.categoriaService.obtenerCategoriasActivas()
      .subscribe({
        next: (response) => {
          this.categoriasParaDropdown = response.datos;
        },
        error: (error) => {
          console.error('Error al cargar categorías activas:', error);
        }
      });
  }

  abrirModalCategoria(categoria?: Categoria): void {
    this.categoriaEditando = categoria || null;
    this.categoriaModalAbierto = true;
    
    if (categoria) {
      this.categoriaForm.patchValue({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || '',
        activo: categoria.activo
      });
    } else {
      this.categoriaForm.reset({ activo: true });
    }
  }

  cerrarModalCategoria(): void {
    this.categoriaModalAbierto = false;
    this.categoriaEditando = null;
    this.categoriaForm.reset({ activo: true });
  }

  guardarCategoria(): void {
    if (this.categoriaForm.valid) {
      const datosCategoria = this.categoriaForm.value;
      
      if (this.categoriaEditando) {
        this.actualizarCategoria(this.categoriaEditando.id_categoria, datosCategoria);
      } else {
        this.crearCategoria(datosCategoria);
      }
    } else {
      this.marcarFormularioComoTocado(this.categoriaForm);
    }
  }

  crearCategoria(datos: CategoriaCreate): void {
    this.categoriaService.crearCategoria(datos)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Categoría creada correctamente', 'Cerrar', { duration: 3000 });
          this.cerrarModalCategoria();
          this.cargarCategorias();
          this.cargarCategoriasActivas();
        },
        error: (error) => {
          console.error('Error al crear categoría:', error);
          this.snackBar.open('Error al crear categoría', 'Cerrar', { duration: 3000 });
        }
      });
  }

  actualizarCategoria(id: number, datos: CategoriaUpdate): void {
    this.categoriaService.actualizarCategoria(id, datos)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Categoría actualizada correctamente', 'Cerrar', { duration: 3000 });
          this.cerrarModalCategoria();
          this.cargarCategorias();
          this.cargarCategoriasActivas();
        },
        error: (error) => {
          console.error('Error al actualizar categoría:', error);
          this.snackBar.open('Error al actualizar categoría', 'Cerrar', { duration: 3000 });
        }
      });
  }

  eliminarCategoria(categoria: Categoria): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Eliminar Categoría',
        mensaje: `¿Estás seguro de que deseas eliminar la categoría "${categoria.nombre}"?`,
        confirmarTexto: 'Eliminar',
        cancelarTexto: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.categoriaService.eliminarCategoria(categoria.id_categoria)
          .subscribe({
            next: (response) => {
              this.snackBar.open('Categoría eliminada correctamente', 'Cerrar', { duration: 3000 });
              this.cargarCategorias();
              this.cargarCategoriasActivas();
            },
            error: (error) => {
              console.error('Error al eliminar categoría:', error);
              this.snackBar.open('Error al eliminar categoría', 'Cerrar', { duration: 3000 });
            }
          });
      }
    });
  }

  aplicarFiltrosCategoria(): void {
    this.categoriaPagina = 1;
    this.cargarCategorias();
  }

  limpiarFiltrosCategoria(): void {
    this.categoriaFiltros = {
      activo: 'true',
      busqueda: ''
    };
    this.aplicarFiltrosCategoria();
  }

  onCategoriaPageChange(event: PageEvent): void {
    this.categoriaPagina = event.pageIndex + 1;
    this.categoriaLimite = event.pageSize;
    this.cargarCategorias();
  }

  // Métodos para productos
  cargarProductos(): void {
    this.productoCargando = true;
    this.productoService.obtenerProductos(this.productoPagina, this.productoLimite, this.productoFiltros)
      .subscribe({
        next: (response) => {
          const productos = response.datos.datos || [];
          let total = response.datos.paginacion?.total || 0;
          
          // WORKAROUND: Si el backend devuelve total=0 pero hay datos
          if (total === 0 && productos.length > 0) {
            if (productos.length === this.productoLimite) {
              total = this.productoPagina * this.productoLimite + 1;
            } else {
              total = (this.productoPagina - 1) * this.productoLimite + productos.length;
            }
          }
          
          this.productos = productos;
          this.productosDataSource.data = this.productos;
          this.productoTotal = total;
          this.productoCargando = false;
        },
        error: (error) => {
          console.error('Error al cargar productos:', error);
          this.snackBar.open('Error al cargar productos', 'Cerrar', { duration: 3000 });
          this.productoCargando = false;
        }
      });
  }

  abrirModalProducto(producto?: Producto): void {
    this.productoEditando = producto || null;
    this.productoModalAbierto = true;
    
    if (producto) {
      this.productoForm.patchValue({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        sku: producto.sku || '',
        codigo_barras: producto.codigo_barras || '',
        id_categoria: producto.id_categoria,
        id_marca: producto.id_marca,
        precio_unitario: producto.precio_unitario,
        stock: producto.stock,
        fecha_vencimiento: producto.fecha_vencimiento ? new Date(producto.fecha_vencimiento) : '',
        activo: producto.activo
      });
    } else {
      this.productoForm.reset({ 
        precio_unitario: 0, 
        stock: 0, 
        activo: true 
      });
    }
  }

  cerrarModalProducto(): void {
    this.productoModalAbierto = false;
    this.productoEditando = null;
    this.productoForm.reset({ 
      precio_unitario: 0, 
      stock: 0, 
      activo: true 
    });
  }

  guardarProducto(): void {
    if (this.productoForm.valid) {
      const datosProducto = this.productoForm.value;
      
      // Formatear fecha de vencimiento
      if (datosProducto.fecha_vencimiento) {
        datosProducto.fecha_vencimiento = datosProducto.fecha_vencimiento.toISOString().split('T')[0];
      }
      
      if (this.productoEditando) {
        this.actualizarProducto(this.productoEditando.id_producto, datosProducto);
      } else {
        this.crearProducto(datosProducto);
      }
    } else {
      this.marcarFormularioComoTocado(this.productoForm);
    }
  }

  crearProducto(datos: ProductoCreate): void {
    this.productoService.crearProducto(datos)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Producto creado correctamente', 'Cerrar', { duration: 3000 });
          this.cerrarModalProducto();
          this.cargarProductos();
        },
        error: (error) => {
          console.error('Error al crear producto:', error);
          this.snackBar.open('Error al crear producto', 'Cerrar', { duration: 3000 });
        }
      });
  }

  actualizarProducto(id: number, datos: ProductoUpdate): void {
    this.productoService.actualizarProducto(id, datos)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Producto actualizado correctamente', 'Cerrar', { duration: 3000 });
          this.cerrarModalProducto();
          this.cargarProductos();
        },
        error: (error) => {
          console.error('Error al actualizar producto:', error);
          this.snackBar.open('Error al actualizar producto', 'Cerrar', { duration: 3000 });
        }
      });
  }

  eliminarProducto(producto: Producto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Eliminar Producto',
        mensaje: `¿Estás seguro de que deseas eliminar el producto "${producto.nombre}"?`,
        confirmarTexto: 'Eliminar',
        cancelarTexto: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productoService.eliminarProducto(producto.id_producto)
          .subscribe({
            next: (response) => {
              this.snackBar.open('Producto eliminado correctamente', 'Cerrar', { duration: 3000 });
              this.cargarProductos();
            },
            error: (error) => {
              console.error('Error al eliminar producto:', error);
              this.snackBar.open('Error al eliminar producto', 'Cerrar', { duration: 3000 });
            }
          });
      }
    });
  }

  aplicarFiltrosProducto(): void {
    this.productoPagina = 1;
    this.cargarProductos();
  }

  limpiarFiltrosProducto(): void {
    this.productoFiltros = {
      activo: '',
      id_categoria: '',
      busqueda: ''
    };
    this.aplicarFiltrosProducto();
  }

  onProductoPageChange(event: PageEvent): void {
    this.productoPagina = event.pageIndex + 1;
    this.productoLimite = event.pageSize;
    this.cargarProductos();
  }

  // Métodos auxiliares
  // Métodos para marcas
  cargarMarcas(): void {
    this.marcaCargando = true;
    this.marcaService.obtenerMarcas(this.marcaPagina, this.marcaLimite, this.marcaFiltros)
      .subscribe({
        next: (response) => {
          const marcas = response.datos.datos || [];
          let total = response.datos.paginacion?.total || 0;
          
          // WORKAROUND: Si el backend devuelve total=0 pero hay datos
          if (total === 0 && marcas.length > 0) {
            if (marcas.length === this.marcaLimite) {
              total = this.marcaPagina * this.marcaLimite + 1;
            } else {
              total = (this.marcaPagina - 1) * this.marcaLimite + marcas.length;
            }
          }
          
          this.marcas = marcas;
          this.marcasDataSource.data = this.marcas;
          this.marcaTotal = total;
          this.marcaCargando = false;
        },
        error: (error) => {
          console.error('Error al cargar marcas:', error);
          this.snackBar.open('Error al cargar marcas', 'Cerrar', { duration: 3000 });
          this.marcaCargando = false;
        }
      });
  }

  cargarMarcasActivas(): void {
    this.marcaService.obtenerMarcasActivas()
      .subscribe({
        next: (response) => {
          this.marcasParaDropdown = response.datos;
        },
        error: (error) => {
          console.error('Error al cargar marcas activas:', error);
        }
      });
  }

  abrirModalMarca(marca?: Marca): void {
    this.marcaEditando = marca || null;
    this.marcaModalAbierto = true;

    if (marca) {
      this.marcaForm.patchValue({
        nombre: marca.nombre,
        descripcion: marca.descripcion,
        activo: marca.activo
      });
    } else {
      this.marcaForm.reset({
        nombre: '',
        descripcion: '',
        activo: true
      });
    }
  }

  cerrarModalMarca(): void {
    this.marcaModalAbierto = false;
    this.marcaEditando = null;
    this.marcaForm.reset({
      nombre: '',
      descripcion: '',
      activo: true
    });
  }

  guardarMarca(): void {
    if (this.marcaForm.invalid) {
      this.marcarFormularioComoTocado(this.marcaForm);
      return;
    }

    const datosMarca = this.marcaForm.value;

    if (this.marcaEditando) {
      // Actualizar marca existente
      this.marcaService.actualizarMarca(this.marcaEditando.id_marca, datosMarca)
        .subscribe({
          next: (response) => {
            this.snackBar.open('Marca actualizada exitosamente', 'Cerrar', { duration: 3000 });
            this.cerrarModalMarca();
            this.cargarMarcas();
            this.cargarMarcasActivas();
          },
          error: (error) => {
            console.error('Error al actualizar marca:', error);
            this.snackBar.open('Error al actualizar marca', 'Cerrar', { duration: 3000 });
          }
        });
    } else {
      // Crear nueva marca
      this.marcaService.crearMarca(datosMarca)
        .subscribe({
          next: (response) => {
            this.snackBar.open('Marca creada exitosamente', 'Cerrar', { duration: 3000 });
            this.cerrarModalMarca();
            this.cargarMarcas();
            this.cargarMarcasActivas();
          },
          error: (error) => {
            console.error('Error al crear marca:', error);
            this.snackBar.open('Error al crear marca', 'Cerrar', { duration: 3000 });
          }
        });
    }
  }

  eliminarMarca(marca: Marca): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Eliminar Marca',
        mensaje: `¿Estás seguro de que deseas eliminar la marca "${marca.nombre}"?`,
        confirmarTexto: 'Eliminar',
        cancelarTexto: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.marcaService.eliminarMarca(marca.id_marca)
          .subscribe({
            next: (response) => {
              this.snackBar.open('Marca eliminada exitosamente', 'Cerrar', { duration: 3000 });
              this.cargarMarcas();
              this.cargarMarcasActivas();
            },
            error: (error) => {
              console.error('Error al eliminar marca:', error);
              this.snackBar.open('Error al eliminar marca', 'Cerrar', { duration: 3000 });
            }
          });
      }
    });
  }

  onMarcaPageChange(event: PageEvent): void {
    this.marcaPagina = event.pageIndex + 1;
    this.marcaLimite = event.pageSize;
    this.cargarMarcas();
  }

  aplicarFiltrosMarca(): void {
    this.marcaPagina = 1;
    this.cargarMarcas();
  }

  limpiarFiltrosMarca(): void {
    this.marcaFiltros = {
      activo: '',
      busqueda: ''
    };
    this.aplicarFiltrosMarca();
  }

  marcarFormularioComoTocado(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.markAsTouched();
    });
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  formatearPrecio(precio: any): string {
    if (precio === null || precio === undefined || precio === '') {
      return 'Q0.00';
    }
    
    const precioNumero = typeof precio === 'string' ? parseFloat(precio) : Number(precio);
    
    if (isNaN(precioNumero)) {
      return 'Q0.00';
    }
    
    return `Q${precioNumero.toFixed(2)}`;
  }

  obtenerEstadoStock(stock: number): string {
    if (stock === 0) return 'Sin stock';
    if (stock < 10) return 'Stock bajo';
    return 'Stock normal';
  }

  obtenerColorStock(stock: number): string {
    if (stock === 0) return 'warn';
    if (stock < 10) return 'accent';
    return 'primary';
  }
}
