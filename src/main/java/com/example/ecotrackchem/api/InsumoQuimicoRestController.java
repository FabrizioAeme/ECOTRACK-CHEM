package com.example.ecotrackchem.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.ecotrackchem.dto.InsumoQuimicoRequest;
import com.example.ecotrackchem.dto.InsumoQuimicoResponse;
import com.example.ecotrackchem.dto.PaginaResponse;
import com.example.ecotrackchem.service.InsumoQuimicoService;
import com.example.ecotrackchem.util.NivelPeligrosidad;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/v1/insumos")
@RequiredArgsConstructor
@Tag(name = "Insumos quimicos", description = "Materias primas identificadas por su codigo CAS")
public class InsumoQuimicoRestController {

    private final InsumoQuimicoService service;

    @Operation(summary = "Listar todos los insumos", description = "Devuelve la lista completa sin paginar (usada en combos y en el panel de control)")
    @ApiResponse(responseCode = "200", description = "Listado completo")
    @ApiResponse(responseCode = "401", description = "Token ausente, invalido o expirado")
    @GetMapping
    public ResponseEntity<List<InsumoQuimicoResponse>> listar() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Listar insumos paginados", description = "Busqueda, filtro y ordenamiento del lado del servidor. Campos de orden permitidos: id, codigoCas, nombre, nivelPureza, nivelPeligrosidad, stockDisponible")
    @ApiResponse(responseCode = "200", description = "Pagina solicitada")
    @ApiResponse(responseCode = "400", description = "Parametros de paginacion invalidos")
    @ApiResponse(responseCode = "401", description = "Token ausente, invalido o expirado")
    @GetMapping("/paginado")
    public ResponseEntity<PaginaResponse<InsumoQuimicoResponse>> listarPaginado(
            @Parameter(description = "Texto a buscar en nombre o codigo CAS") @RequestParam(defaultValue = "") String buscar,
            @Parameter(description = "Filtra por nivel de peligrosidad") @RequestParam(required = false) NivelPeligrosidad nivelPeligrosidad,
            @Parameter(description = "Numero de pagina, empieza en 0") @RequestParam(defaultValue = "0") int pagina,
            @Parameter(description = "Registros por pagina (1 a 50)") @RequestParam(defaultValue = "10") int tamanio,
            @Parameter(description = "Campo por el que se ordena") @RequestParam(defaultValue = "nombre") String ordenarPor,
            @Parameter(description = "asc o desc") @RequestParam(defaultValue = "asc") String direccion) {
        return ResponseEntity.ok(service.getPagina(buscar, nivelPeligrosidad, pagina, tamanio, ordenarPor, direccion));
    }

    @Operation(summary = "Ver detalle de un insumo")
    @ApiResponse(responseCode = "200", description = "Registro encontrado")
    @ApiResponse(responseCode = "404", description = "No existe un registro con ese id")
    @GetMapping("/{id}")
    public ResponseEntity<InsumoQuimicoResponse> verDetalle(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Registrar un insumo", description = "El codigo CAS no puede repetirse")
    @ApiResponse(responseCode = "201", description = "Registro creado")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    @ApiResponse(responseCode = "409", description = "Viola una regla de negocio")
    @PostMapping
    public ResponseEntity<InsumoQuimicoResponse> crear(@Valid @RequestBody InsumoQuimicoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @Operation(summary = "Actualizar un insumo", description = "El codigo CAS no puede repetirse")
    @ApiResponse(responseCode = "200", description = "Registro actualizado")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    @ApiResponse(responseCode = "404", description = "No existe un registro con ese id")
    @ApiResponse(responseCode = "409", description = "Viola una regla de negocio")
    @PutMapping("/{id}")
    public ResponseEntity<InsumoQuimicoResponse> actualizar(@PathVariable Integer id, @Valid @RequestBody InsumoQuimicoRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @Operation(summary = "Eliminar un insumo", description = "Solo ADMINISTRADOR. No se puede eliminar si esta asociado a lotes")
    @ApiResponse(responseCode = "204", description = "Registro eliminado")
    @ApiResponse(responseCode = "403", description = "El usuario no es administrador")
    @ApiResponse(responseCode = "404", description = "No existe un registro con ese id")
    @ApiResponse(responseCode = "409", description = "Tiene registros asociados")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
