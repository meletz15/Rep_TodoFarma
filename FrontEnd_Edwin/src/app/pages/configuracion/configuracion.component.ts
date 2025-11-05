import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfiguracionService, FormatoSistema, DatosFacturacion, DireccionEmpresa, TelefonosEmpresa } from '../../services/configuracion.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {
  
  // Control de tabs
  tabActivo = 0;
  tabs = [
    { label: 'Formato del Sistema' },
    { label: 'Datos de Facturación' },
    { label: 'Dirección de la Empresa' },
    { label: 'Teléfonos de la Empresa' }
  ];
  
  cargando = false;
  
  // Configuración de formato del sistema
  formatoSistema: FormatoSistema = {
    formatoFecha: 'DD/MM/YYYY',
    formatoHora: '24h',
    formatoMoneda: 'Q',
    separadorDecimal: ',',
    separadorMiles: '.',
    idioma: 'es',
    zonaHoraria: 'America/Guatemala'
  };

  // Configuración de datos de NIT y mensaje de factura
  datosFacturacion: DatosFacturacion = {
    nit: '',
    nombreEmpresa: 'Farmacia TodoFarma',
    mensajeFactura: 'Gracias por su compra. Vuelva pronto.',
    mensajePie: 'Conserve este comprobante para garantías'
  };

  // Dirección de la empresa
  direccionEmpresa: DireccionEmpresa = {
    direccion: '',
    ciudad: '',
    departamento: '',
    codigoPostal: '',
    pais: 'Guatemala'
  };

  // Números telefónicos de la empresa
  telefonosEmpresa: TelefonosEmpresa = {
    telefonoPrincipal: '',
    telefonoSecundario: '',
    fax: '',
    whatsapp: '',
    email: '',
    sitioWeb: ''
  };

  // Opciones para selects
  opcionesFormatoFecha = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (25/12/2025)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/25/2025)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-12-25)' }
  ];

  opcionesFormatoHora = [
    { value: '24h', label: '24 horas (14:30)' },
    { value: '12h', label: '12 horas (2:30 PM)' }
  ];

  opcionesFormatoMoneda = [
    { value: 'Q', label: 'Quetzal (Q)' },
    { value: '$', label: 'Dólar ($)' },
    { value: '€', label: 'Euro (€)' }
  ];

  opcionesIdioma = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'Inglés' }
  ];

  opcionesZonaHoraria = [
    { value: 'America/Guatemala', label: 'Guatemala (GMT-6)' },
    { value: 'America/Mexico_City', label: 'México (GMT-6)' },
    { value: 'America/New_York', label: 'Nueva York (GMT-5)' }
  ];

  constructor(
    private snackBar: MatSnackBar,
    private configuracionService: ConfiguracionService
  ) {}

  ngOnInit() {
    this.cargarConfiguraciones();
  }

  cargarConfiguraciones() {
    this.cargando = true;
    this.configuracionService.obtenerConfiguracion().subscribe({
      next: (response) => {
        if (response.ok && response.datos) {
          this.formatoSistema = response.datos.formatoSistema || this.formatoSistema;
          this.datosFacturacion = response.datos.datosFacturacion || this.datosFacturacion;
          this.direccionEmpresa = response.datos.direccionEmpresa || this.direccionEmpresa;
          this.telefonosEmpresa = response.datos.telefonosEmpresa || this.telefonosEmpresa;
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar configuraciones:', error);
        this.snackBar.open('Error al cargar la configuración', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }

  guardarFormatoSistema() {
    this.cargando = true;
    this.configuracionService.actualizarFormato(this.formatoSistema).subscribe({
      next: (response) => {
        if (response.ok) {
          this.snackBar.open('Configuración de formato guardada exitosamente', 'Cerrar', { duration: 3000 });
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al guardar formato:', error);
        this.snackBar.open('Error al guardar la configuración de formato', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }

  guardarDatosFacturacion() {
    this.cargando = true;
    this.configuracionService.actualizarFacturacion(this.datosFacturacion).subscribe({
      next: (response) => {
        if (response.ok) {
          this.snackBar.open('Datos de facturación guardados exitosamente', 'Cerrar', { duration: 3000 });
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al guardar facturación:', error);
        this.snackBar.open('Error al guardar los datos de facturación', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }

  guardarDireccionEmpresa() {
    this.cargando = true;
    this.configuracionService.actualizarDireccion(this.direccionEmpresa).subscribe({
      next: (response) => {
        if (response.ok) {
          this.snackBar.open('Dirección de empresa guardada exitosamente', 'Cerrar', { duration: 3000 });
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al guardar dirección:', error);
        this.snackBar.open('Error al guardar la dirección de empresa', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }

  guardarTelefonosEmpresa() {
    this.cargando = true;
    this.configuracionService.actualizarTelefonos(this.telefonosEmpresa).subscribe({
      next: (response) => {
        if (response.ok) {
          this.snackBar.open('Teléfonos de empresa guardados exitosamente', 'Cerrar', { duration: 3000 });
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al guardar teléfonos:', error);
        this.snackBar.open('Error al guardar los teléfonos de empresa', 'Cerrar', { duration: 3000 });
        this.cargando = false;
      }
    });
  }

  resetearFormatoSistema() {
    this.formatoSistema = {
      formatoFecha: 'DD/MM/YYYY',
      formatoHora: '24h',
      formatoMoneda: 'Q',
      separadorDecimal: ',',
      separadorMiles: '.',
      idioma: 'es',
      zonaHoraria: 'America/Guatemala'
    };
    this.snackBar.open('Configuración de formato restablecida', 'Cerrar', { duration: 3000 });
  }

  resetearDatosFacturacion() {
    this.datosFacturacion = {
      nit: '12345678-9',
      nombreEmpresa: 'Farmacia TodoFarma',
      mensajeFactura: 'Gracias por su compra. Vuelva pronto.',
      mensajePie: 'Conserve este comprobante para garantías'
    };
    this.snackBar.open('Datos de facturación restablecidos', 'Cerrar', { duration: 3000 });
  }

  resetearDireccionEmpresa() {
    this.direccionEmpresa = {
      direccion: '5ta Avenida 12-34, Zona 1',
      ciudad: 'Guatemala',
      departamento: 'Guatemala',
      codigoPostal: '01001',
      pais: 'Guatemala'
    };
    this.snackBar.open('Dirección de empresa restablecida', 'Cerrar', { duration: 3000 });
  }

  resetearTelefonosEmpresa() {
    this.telefonosEmpresa = {
      telefonoPrincipal: '502-2251-2345',
      telefonoSecundario: '502-2251-2346',
      fax: '502-2251-2347',
      whatsapp: '502-5555-1234',
      email: 'info@todofarma.com',
      sitioWeb: 'www.todofarma.com'
    };
    this.snackBar.open('Teléfonos de empresa restablecidos', 'Cerrar', { duration: 3000 });
  }
}
