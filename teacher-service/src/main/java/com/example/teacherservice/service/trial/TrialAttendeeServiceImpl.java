package com.example.teacherservice.service.trial;

import com.example.teacherservice.dto.trial.TrialAttendeeDto;
import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.model.TrialAttendee;
import com.example.teacherservice.model.TrialTeaching;
import com.example.teacherservice.model.User;
import com.example.teacherservice.repository.TrialAttendeeRepository;
import com.example.teacherservice.repository.TrialTeachingRepository;
import com.example.teacherservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.teacherservice.enums.TrialAttendeeRole;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TrialAttendeeServiceImpl implements TrialAttendeeService {

    private final TrialAttendeeRepository attendeeRepository;
    private final TrialTeachingRepository trialRepository;
    private final UserRepository userRepository;

    @Override
    public TrialAttendeeDto addAttendee(String trialId, String attendeeName, String attendeeRole, String attendeeUserId) {
        TrialTeaching trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new NotFoundException("Trial not found"));

        User user = null;
        if(attendeeUserId != null) {
            user = userRepository.findById(attendeeUserId)
                    .orElseThrow(() -> new NotFoundException("User not found"));
        }

        TrialAttendee attendee = new TrialAttendee();
        attendee.setTrial(trial);
        attendee.setAttendeeName(attendeeName);
        attendee.setAttendeeRole(TrialAttendeeRole.valueOf(attendeeRole.toUpperCase()));
        attendee.setAttendeeUser(user);

        return toDto(attendeeRepository.save(attendee));
    }

    @Override
    public List<TrialAttendeeDto> getAttendeesByTrial(String trialId) {
        return attendeeRepository.findByTrial_Id(trialId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void removeAttendee(String attendeeId) {
        TrialAttendee attendee = attendeeRepository.findById(attendeeId)
                .orElseThrow(() -> new NotFoundException("Attendee not found"));
        attendeeRepository.delete(attendee);
    }

    private TrialAttendeeDto toDto(TrialAttendee attendee) {
        return TrialAttendeeDto.builder()
                .id(attendee.getId())
                .trialId(attendee.getTrial().getId())
                .attendeeName(attendee.getAttendeeName())
                .attendeeRole(attendee.getAttendeeRole())
                .attendeeUserId(attendee.getAttendeeUser() != null ? attendee.getAttendeeUser().getId() : null)
                .build();
    }
}
