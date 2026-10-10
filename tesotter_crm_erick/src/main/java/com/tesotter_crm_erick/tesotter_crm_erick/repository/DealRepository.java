package com.tesotter_crm_erick.tesotter_crm_erick.repository;
import com.tesotter_crm_erick.tesotter_crm_erick.domain.Deal;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface DealRepository extends MongoRepository<Deal,String> {}
