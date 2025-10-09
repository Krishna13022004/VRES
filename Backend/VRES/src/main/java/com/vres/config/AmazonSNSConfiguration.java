package com.vres.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sns.SnsClient;

@Configuration
public class AmazonSNSConfiguration {

    @Value("${spring.cloud.aws.region.static}")
    private String region;

    @Value("${AWS_SNS_ACCESS_KEY_ID}")
    private String awsAccessKey;

    @Value("${AWS_SNS_SECRET_ACCESS_KEY}")
    private String awsSecretKey;

    @Primary
    @Bean
    SnsClient snsClient() {
        return SnsClient.builder()
                .region(Region.of(region))
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(
                                        awsAccessKey,
                                        awsSecretKey
                                )
                        )
                )
                .build();
    }
}