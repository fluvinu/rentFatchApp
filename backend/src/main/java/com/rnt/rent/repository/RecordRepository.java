package com.rnt.rent.repository;

import com.rnt.rent.entity.Record;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface RecordRepository extends MongoRepository<Record, String> {
    List<Record> findByDatasetId(String datasetId);
}
