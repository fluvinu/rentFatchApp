package com.rnt.rent.controller;

import com.rnt.rent.entity.Dataset;
import com.rnt.rent.repository.DatasetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/dataset")
public class DatasetController {

    @Autowired
    private DatasetRepository datasetRepository;

    @GetMapping({"", "/"})
    public List<Dataset> getAllDatasets() {
        return datasetRepository.findAll();
    }

    @PostMapping({"", "/"})
    public Dataset createDataset(@RequestBody Dataset dataset) {
        return datasetRepository.save(dataset);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dataset> getDatasetById(@PathVariable String id) {
        Optional<Dataset> dataset = datasetRepository.findById(id);
        return dataset.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dataset> updateDataset(@PathVariable String id, @RequestBody Dataset datasetDetails) {
        Optional<Dataset> dataset = datasetRepository.findById(id);
        if (dataset.isPresent()) {
            Dataset existingDataset = dataset.get();
            existingDataset.setName(datasetDetails.getName());
            existingDataset.setDescription(datasetDetails.getDescription());
            existingDataset.setFields(datasetDetails.getFields());
            return ResponseEntity.ok(datasetRepository.save(existingDataset));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDataset(@PathVariable String id) {
        if (datasetRepository.existsById(id)) {
            datasetRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
