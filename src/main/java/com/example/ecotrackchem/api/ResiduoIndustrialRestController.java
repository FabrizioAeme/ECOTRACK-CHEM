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

import com.example.ecotrackchem.dto.ResiduoIndustrialRequest;
import com.example.ecotrackchem.dto.ResiduoIndustrialResponse;
import com.example.ecotrackchem.dto.PaginaResponse;
import com.example.ecotrackchem.service.ResiduoIndustrialService;
import com.example.ecotrackchem.util.DisposicionFinal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/v1/residuos")
@RequiredArgsConstructor
@Tag(name = "Residuos industriales", description = "Subproductos generados por cada lote y su disposicion final")
public class ResiduoIndustrialRestController {

    private final ResiduoIndustrialService service;

    @Operation(summary = "Listar todos los residuos", description = "Devuelve la lista completa sin paginar (usada en combos y en el panel de control)")
    @ApiResponse(responseCode = "200", description = "Listado completo")
    @ApiResponse(responseCode = "401", description = "Token ausente, invalido o expirado")
    @GetMapping
    public ResponseEntity<List<ResiduoIndustrialResponse>> listar() {
        return ResponseEntity.ok(service.getAll());
    }

    @Operation(summary = "Listar residuos paginados", description = "Busqueda, filtro y ordenamiento del lado del servidor. Campos de orden permitidos: id, tipoResiduo, volumenLitros, disposicionFinal, requiereCertificado")
    @ApiResponse(responseCode = "200", description = "Pagina solicitada")
    @ApiResponse(responseCode = "400", description = "Parametros de paginacion invalidos")
    @ApiResponse(responseCode = "401", description = "Token ausente, invalido o expirado")
    @GetMapping("/paginado")
    public ResponseEntity<PaginaResponse<ResiduoIndustrialResponse>> listarPaginado(
            @Parameter(description = "Texto a buscar en tipo de residuo o codigo de lote") @RequestParam(defaultValue = "") String buscar,
            @Parameter(description = "Filtra por disposicion final") @RequestParam(required = false) DisposicionFinal disposicionFinal,
            @Parameter(description = "Numero de pagina, empieza en 0") @RequestParam(defaultValue = "0") int pagina,
            @Parameter(description = "Registros por pagina (1 a 50)") @RequestParam(defaultValue = "10") int tamanio,
            @Parameter(description = "Campo por el que se ordena") @RequestParam(defaultValue = "id") String ordenarPor,
            @Parameter(description = "asc o desc") @RequestParam(defaultValue = "desc") String direccion) {
        return ResponseEntity.ok(service.getPagina(buscar, disposicionFinal, pagina, tamanio, ordenarPor, direccion));
    }

    @Operation(summary = "Ver detalle de un residuo")
    @ApiResponse(responseCode = "200", description = "Registro encontrado")
    @ApiResponse(responseCode = "404", description = "No existe un registro con ese id")
    @GetMapping("/{id}")
    public ResponseEntity<ResiduoIndustrialResponse> verDetalle(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Registrar un residuo", description = "El lote no debe estar AUDITADO y RECOGIDA_ESPECIAL exige certificado")
    @ApiResponse(responseCode = "201", description = "Registro creado")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    @ApiResponse(responseCode = "409", description = "Viola una regla de negocio")
    @PostMapping
    public ResponseEntity<ResiduoIndustrialResponse> crear(@Valid @RequestBody ResiduoIndustrialRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @Operation(summary = "Actualizar un residuo", description = "El lote no debe estar AUDITADO y RECOGIDA_ESPECIAL exige certificado")
    @ApiResponse(responseCode = "200", description = "Registro actualizado")
    @ApiResponse(responseCode = "400", description = "Datos invalidos")
    @ApiResponse(responseCode = "404", description = "No existe un registro con ese id")
    @ApiResponse(responseCode = "409", description = "Viola una regla de negocio")
    @PutMapping("/{id}")
    public ResponseEntity<ResiduoIndustrialResponse> actualizar(@PathVariable Integer id, @Valid @RequestBody ResiduoIndustrialRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @Operation(summary = "Eliminar un residuo", description = "Solo ADMINISTRADOR. No se puede eliminar si su lote esta auditado")
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
