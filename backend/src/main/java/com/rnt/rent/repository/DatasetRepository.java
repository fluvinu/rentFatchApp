package com.rnt.rent.repository;

import com.rnt.rent.entity.Dataset;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface DatasetRepository extends MongoRepository<Dataset, String> {
}
