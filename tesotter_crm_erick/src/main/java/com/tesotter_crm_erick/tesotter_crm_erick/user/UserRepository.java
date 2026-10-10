package com.tesotter_crm_erick.tesotter_crm_erick.user;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface UserRepository extends MongoRepository<CrmUser,String> { Optional<CrmUser> findByEmail(String email); }
