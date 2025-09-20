import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  
  // Configuración de formato del sistema
  formatoSistema = {
    formatoFecha: 'DD/MM/YYYY',
    formatoHora: '24h',
    formatoMoneda: 'Q',
    separadorDecimal: ',',
    separadorMiles: '.',
    idioma: 'es',
    zonaHoraria: 'America/Guatemala'
  };

  // Configuración de datos de NIT y mensaje de factura
  datosFacturacion = {
    nit: '12345678-9',
    nombreEmpresa: 'Farmacia TodoFarma',
    mensajeFactura: 'Gracias por su compra. Vuelva pronto.',
    mensajePie: 'Conserve este comprobante para garantías'
  };

  // Dirección de la empresa
  direccionEmpresa = {
    direccion: '5ta Avenida 12-34, Zona 1',
    ciudad: 'Guatemala',
    departamento: 'Guatemala',
    codigoPostal: '01001',
    pais: 'Guatemala'
  };

  // Números telefónicos de la empresa
  telefonosEmpresa = {
    telefonoPrincipal: '502-2251-2345',
    telefonoSecundario: '502-2251-2346',
    fax: '502-2251-2347',
    whatsapp: '502-5555-1234',
    email: 'info@todofarma.com',
    sitioWeb: 'www.todofarma.com'
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

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    // Cargar configuraciones guardadas (simulado)
    this.cargarConfiguraciones();
  }

  cargarConfiguraciones() {
    // Simular carga de configuraciones desde localStorage o base de datos
    console.log('Cargando configuraciones del sistema...');
  }

  guardarFormatoSistema() {
    // Simular guardado de configuración de formato
    console.log('Guardando formato del sistema:', this.formatoSistema);
    this.snackBar.open('Configuración de formato guardada exitosamente', 'Cerrar', { duration: 3000 });
  }

  guardarDatosFacturacion() {
    // Simular guardado de datos de facturación
    console.log('Guardando datos de facturación:', this.datosFacturacion);
    this.snackBar.open('Datos de facturación guardados exitosamente', 'Cerrar', { duration: 3000 });
  }

  guardarDireccionEmpresa() {
    // Simular guardado de dirección
    console.log('Guardando dirección de empresa:', this.direccionEmpresa);
    this.snackBar.open('Dirección de empresa guardada exitosamente', 'Cerrar', { duration: 3000 });
  }

  guardarTelefonosEmpresa() {
    // Simular guardado de teléfonos
    console.log('Guardando teléfonos de empresa:', this.telefonosEmpresa);
    this.snackBar.open('Teléfonos de empresa guardados exitosamente', 'Cerrar', { duration: 3000 });
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
