package com.rnt.rent.controller;

import com.rnt.rent.entity.Record;
import com.rnt.rent.repository.RecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/record")
public class RecordController {

    @Autowired
    private RecordRepository recordRepository;

    @GetMapping
    public List<Record> getAllRecords(@RequestParam(required = false) String datasetId) {
        if (datasetId != null && !datasetId.isEmpty()) {
            return recordRepository.findByDatasetId(datasetId);
        }
        return recordRepository.findAll();
    }

    @PostMapping
    public Record createRecord(@RequestBody Record record) {
        return recordRepository.save(record);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Record> getRecordById(@PathVariable String id) {
        Optional<Record> record = recordRepository.findById(id);
        return record.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Record> updateRecord(@PathVariable String id, @RequestBody Record recordDetails) {
        Optional<Record> record = recordRepository.findById(id);
        if (record.isPresent()) {
            Record existingRecord = record.get();
            existingRecord.setDatasetId(recordDetails.getDatasetId());
            existingRecord.setData(recordDetails.getData());
            return ResponseEntity.ok(recordRepository.save(existingRecord));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable String id) {
        if (recordRepository.existsById(id)) {
            recordRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
